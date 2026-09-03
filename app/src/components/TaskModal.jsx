import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../data/TaskContext';

export default function TaskModal() {
  const ctx = useTaskContext();
  const [showIntro, setShowIntro] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [completedDismissed, setCompletedDismissed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const commentTimerRef = useRef(null);

  // Show intro modal whenever a new task appears
  useEffect(() => {
    if (ctx?.currentTask) {
      setShowIntro(true);
      setShowDescription(false);
    }
  }, [ctx?.currentTaskIndex]);

  if (!ctx || ctx.loading || (!ctx.currentTask && !ctx.allCompleted)) return null;

  // ── All tasks completed — thank you overlay ──
  if (ctx.allCompleted) {
    if (completedDismissed) return null;

    const completedCount = ctx.taskProgress.filter(p => p.status === 'completed').length;
    const skippedCount = ctx.taskProgress.filter(p => p.status === 'skipped').length;

    return (
      <div className="task-overlay">
        <div className="task-modal">
          <div className="task-modal-icon">🎉</div>
          <div className="task-modal-title">Все задания пройдены!</div>
          <div className="task-modal-desc">
            Спасибо за участие в исследовании. Ваши данные сохранены.
          </div>
          <div className="task-modal-meta">
            Выполнено: {completedCount} из {ctx.totalTasks}
            {skippedCount > 0 && <> · Пропущено: {skippedCount}</>}
          </div>
          <button className="task-modal-done-btn" onClick={() => setCompletedDismissed(true)}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const task = ctx.currentTask;

  // ── Intro modal (shown once per task, blocks UI until "Начать") ──
  if (showIntro) {
    return (
      <div className="task-overlay">
        <div className="task-modal">
          <div className="task-modal-header">
            <div className="task-modal-step">
              Задание {ctx.currentTaskIndex + 1} из {ctx.totalTasks}
            </div>
          </div>
          <div className="task-modal-title">{task.title}</div>
          {task.description && (
            <div className="task-modal-desc" style={{ whiteSpace: 'pre-line' }}>
              {task.description}
            </div>
          )}

          <button
            className="task-modal-done-btn"
            onClick={() => setShowIntro(false)}
          >
            Начать задание
          </button>
        </div>
      </div>
    );
  }

  // ── Floating panel (bottom-left, always visible while working) ──
  return (
    <>
      {/* Re-show description popup */}
      {showDescription && (
        <div className="task-overlay" onClick={() => setShowDescription(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <div className="task-modal-step">
                Задание {ctx.currentTaskIndex + 1} из {ctx.totalTasks}
              </div>
              <button
                className="task-modal-minimize"
                onClick={() => setShowDescription(false)}
                title="Закрыть"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="task-modal-title">{task.title}</div>
            {task.description && (
              <div className="task-modal-desc" style={{ whiteSpace: 'pre-line' }}>
                {task.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed bottom-left panel */}
      <div className="task-panel">
        <div className="task-panel-header" onClick={() => setShowDescription(true)}>
          <span className="task-panel-step">
            Задание {ctx.currentTaskIndex + 1}/{ctx.totalTasks}
          </span>
          <span className="task-panel-title">{task.title}</span>
        </div>

        {task.description && (
          <div className="task-panel-desc">{task.description}</div>
        )}

        <div className="task-panel-actions">
          <a className="task-panel-skip-link" onClick={ctx.skipCurrentTask}>
            Не смог выполнить
          </a>
          <a className="task-panel-done-link" onClick={ctx.completeCurrentTask}>
            Задание выполнил
          </a>
        </div>

        {/* Inline comment area */}
        <div className="task-panel-comment">
          <div className="task-panel-comment-label">Что-то непонятно?</div>
          <div className="task-panel-comment-input">
            <textarea
              className="task-panel-comment-textarea"
              placeholder="Напишите комментарий…"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                setCommentSent(false);
              }}
              rows={2}
            />
            {commentSent ? (
              <div className="task-panel-comment-sent">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Отправлено
              </div>
            ) : (
              <button
                className="task-panel-comment-btn"
                disabled={!commentText.trim()}
                onClick={() => {
                  if (!commentText.trim()) return;
                  ctx.addComment(commentText);
                  setCommentText('');
                  setCommentSent(true);
                  if (commentTimerRef.current) clearTimeout(commentTimerRef.current);
                  commentTimerRef.current = setTimeout(() => setCommentSent(false), 3000);
                }}
                title="Отправить"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
