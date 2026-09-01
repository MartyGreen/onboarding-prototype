import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    if (!currentUser) return;

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

  // Complete current task
  const completeCurrentTask = useCallback(() => {
    if (allCompleted || !tasks.length) return;

    const task = tasks[currentTaskIndex];
    if (!task) return;

    const now = Date.now();
    const duration = taskStartTime ? now - taskStartTime : 0;

    const progressEntry = {
      taskKey: task._key,
      title: task.title,
      completedAt: new Date().toISOString(),
      durationMs: duration,
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
        ...(isLast ? { allTasksCompletedAt: new Date().toISOString() } : {}),
      });
    }
  }, [allCompleted, tasks, currentTaskIndex, taskStartTime, taskProgress, currentUser, studyKey]);

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
        loading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
