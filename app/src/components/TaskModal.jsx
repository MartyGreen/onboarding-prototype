import React, { useState } from 'react';
import { useTaskContext } from '../data/TaskContext';

export default function TaskModal() {
  const ctx = useTaskContext();
  const [minimized, setMinimized] = useState(false);
  const [completedDismissed, setCompletedDismissed] = useState(false);

  if (!ctx || ctx.loading || (!ctx.currentTask && !ctx.allCompleted)) return null;

  // All tasks completed — show thank you (dismissable)
  if (ctx.allCompleted) {
    if (completedDismissed) return null;
    return (
      <div className="task-overlay">
        <div className="task-modal">
          <div className="task-modal-icon">🎉</div>
          <div className="task-modal-title">Все задания выполнены!</div>
          <div className="task-modal-desc">
            Спасибо за участие в исследовании. Ваши данные сохранены.
          </div>
          <div className="task-modal-meta">
            Выполнено заданий: {ctx.taskProgress.length} из {ctx.totalTasks}
          </div>
          <button className="task-modal-done-btn" onClick={() => setCompletedDismissed(true)}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  // Minimized — just a floating button
  if (minimized) {
    return (
      <button className="task-fab" onClick={() => setMinimized(false)}>
        <span className="task-fab-badge">{ctx.currentTaskIndex + 1}/{ctx.totalTasks}</span>
        <span className="task-fab-text">Задание</span>
      </button>
    );
  }

  const task = ctx.currentTask;

  return (
    <div className="task-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <div className="task-modal-step">
            Задание {ctx.currentTaskIndex + 1} из {ctx.totalTasks}
          </div>
          <button
            className="task-modal-minimize"
            onClick={() => setMinimized(true)}
            title="Свернуть"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="task-modal-title">{task.title}</div>
        {task.description && (
          <div className="task-modal-desc">{task.description}</div>
        )}
        <div className="task-modal-actions">
          <button className="task-modal-minimize-btn" onClick={() => setMinimized(true)}>
            Свернуть
          </button>
          <button className="task-modal-done-btn" onClick={ctx.completeCurrentTask}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Выполнено
          </button>
        </div>

        {/* Progress dots */}
        <div className="task-modal-progress">
          {ctx.tasks.map((_, i) => (
            <div
              key={i}
              className={`task-dot ${
                i < ctx.currentTaskIndex
                  ? 'done'
                  : i === ctx.currentTaskIndex
                  ? 'current'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
