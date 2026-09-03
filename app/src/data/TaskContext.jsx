import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const FIREBASE_DB_URL = 'https://datagatetest-4f190-default-rtdb.firebaseio.com';

async function fbFetch(path) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([key, val]) => ({ ...val, _key: key }));
  } catch (err) {
    console.warn('Firebase fetch failed:', err);
    return [];
  }
}

async function fbUpdate(path, data) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Firebase update failed:', err);
  }
}

const TaskContext = createContext(null);

export function useTaskContext() {
  return useContext(TaskContext);
}

export function TaskProvider({ currentUser, children }) {
  const [studyKey, setStudyKey] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskProgress, setTaskProgress] = useState([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load active study + tasks on mount
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function init() {
      setLoading(true);

      // Check if user already has study/progress data
      const stored = currentUser;
      let sKey = stored?.studyKey || null;
      let savedProgress = stored?.taskProgress || [];
      let savedIndex = stored?.currentTaskIndex || 0;
      let savedCompleted = stored?.allTasksCompleted || false;

      // If no study key yet, find active study
      if (!sKey) {
        const studies = await fbFetch('onboarding_studies');
        const active = studies.find((s) => s.active);
        if (active) {
          sKey = active._key;
        }
      }

      if (!sKey) {
        setLoading(false);
        return; // No active study
      }

      setStudyKey(sKey);

      // Fetch tasks for this study
      const allTasks = await fbFetch(`onboarding_tasks/${sKey}`);
      const activeTasks = allTasks
        .filter((t) => t.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setTasks(activeTasks);
      setTaskProgress(savedProgress);
      setCurrentTaskIndex(savedIndex);
      setAllCompleted(savedCompleted);
      setTaskStartTime(savedCompleted ? null : Date.now());
      setLoading(false);
    }

    init();
  }, [currentUser]);

  // ── Click tracking ──
  const clickLogRef = useRef([]);

  useEffect(() => {
    function buildSelector(el) {
      if (!el || el === document.body || el === document.documentElement) return 'body';
      const parts = [];
      let cur = el;
      for (let depth = 0; cur && cur !== document.body && depth < 5; depth++) {
        let tag = cur.tagName.toLowerCase();
        if (cur.id) { parts.unshift(tag + '#' + cur.id); break; }
        if (cur.className && typeof cur.className === 'string') {
          const cls = cur.className.trim().split(/\s+/).slice(0, 2).join('.');
          if (cls) tag += '.' + cls;
        }
        parts.unshift(tag);
        cur = cur.parentElement;
      }
      return parts.join(' > ');
    }

    function handleClick(e) {
      if (allCompleted) return;
      if (!tasks.length || currentTaskIndex >= tasks.length) return;

      const rect = document.documentElement;
      const entry = {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        px: +(e.clientX / (rect.clientWidth || 1)).toFixed(4),
        py: +(e.clientY / (rect.clientHeight || 1)).toFixed(4),
        tag: e.target.tagName.toLowerCase(),
        text: (e.target.textContent || '').trim().slice(0, 60),
        selector: buildSelector(e.target),
        url: location.pathname,
        t: Date.now(),
      };
      clickLogRef.current.push(entry);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [allCompleted, tasks, currentTaskIndex]);

  // ── Comments ──
  const commentsRef = useRef([]);

  const addComment = useCallback((text) => {
    if (allCompleted || !tasks.length) return;
    const entry = {
      text: text.trim(),
      t: Date.now(),
      url: location.pathname,
    };
    commentsRef.current.push(entry);

    // Save pending comments to Firebase immediately (under pendingComments field)
    // so they aren't lost if user closes browser before completing the task.
    // On task advance, comments are moved into taskProgress entry.
    if (currentUser._firebaseKey && studyKey) {
      const allComments = [...commentsRef.current];
      fbUpdate(
        `onboarding_participants/${studyKey}/${currentUser._firebaseKey}`,
        { pendingComments: allComments }
      );
    }
  }, [allCompleted, tasks, currentTaskIndex, currentUser, studyKey]);

  // Advance to next task (shared logic for complete & skip)
  const advanceTask = useCallback((status) => {
    if (allCompleted || !tasks.length) return;

    const task = tasks[currentTaskIndex];
    if (!task) return;

    const now = Date.now();
    const duration = taskStartTime ? now - taskStartTime : 0;

    const clicks = [...clickLogRef.current];
    clickLogRef.current = [];

    const comments = [...commentsRef.current];
    commentsRef.current = [];

    const progressEntry = {
      taskKey: task._key,
      title: task.title,
      completedAt: new Date().toISOString(),
      durationMs: duration,
      status, // 'completed' | 'skipped'
      clicks,
      comments,
    };

    const newProgress = [...taskProgress, progressEntry];
    const nextIndex = currentTaskIndex + 1;
    const isLast = nextIndex >= tasks.length;

    setTaskProgress(newProgress);
    setCurrentTaskIndex(nextIndex);
    setAllCompleted(isLast);
    setTaskStartTime(isLast ? null : Date.now());

    // Save to localStorage
    const updatedUser = {
      ...currentUser,
      studyKey,
      taskProgress: newProgress,
      currentTaskIndex: nextIndex,
      allTasksCompleted: isLast,
    };
    localStorage.setItem('onboarding_current_user', JSON.stringify(updatedUser));

    // Save to Firebase
    if (currentUser._firebaseKey && studyKey) {
      fbUpdate(`onboarding_participants/${studyKey}/${currentUser._firebaseKey}`, {
        taskProgress: newProgress,
        currentTaskIndex: nextIndex,
        allTasksCompleted: isLast,
        pendingComments: null, // clear pending comments (moved into taskProgress)
        ...(isLast ? { allTasksCompletedAt: new Date().toISOString() } : {}),
      });
    }
  }, [allCompleted, tasks, currentTaskIndex, taskStartTime, taskProgress, currentUser, studyKey]);

  // Complete current task
  const completeCurrentTask = useCallback(() => advanceTask('completed'), [advanceTask]);

  // Skip current task (couldn't complete)
  const skipCurrentTask = useCallback(() => advanceTask('skipped'), [advanceTask]);

  const currentTask = !allCompleted && tasks.length > 0 ? tasks[currentTaskIndex] : null;

  return (
    <TaskContext.Provider
      value={{
        studyKey,
        tasks,
        currentTask,
        currentTaskIndex,
        totalTasks: tasks.length,
        taskProgress,
        allCompleted,
        completeCurrentTask,
        skipCurrentTask,
        addComment,
        loading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
