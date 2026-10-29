// src/components/dashboard/TodayStudyTasks.jsx
import React from 'react';
import { CheckSquare, Square, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TodayStudyTasks() {
  const { tasks, toggleTaskCompleted } = useApp();
  const navigate = useNavigate();

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard-card today-tasks-widget">
      <div className="card-header-row">
        <div>
          <div className="flex-title-row">
            <Sparkles size={18} className="text-blue-500" />
            <h3 className="card-title">Today's Study Tasks</h3>
            <span className="count-badge">
              {completedCount}/{totalCount} Done
            </span>
          </div>
          <p className="card-subtitle">Daily review goals and prep checklist</p>
        </div>
        <button
          className="btn-action-ghost text-xs"
          onClick={() => navigate('/tasks')}
        >
          <span>Open Tasks</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="tasks-progress-track my-3">
        <div
          className="tasks-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="dashboard-tasks-mini-list">
        {tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className={`dashboard-task-mini-item ${task.completed ? 'completed' : ''}`}
            onClick={() => toggleTaskCompleted(task.id)}
          >
            <button className="task-checkbox-btn" aria-label="Toggle task">
              {task.completed ? (
                <CheckSquare size={18} className="text-emerald-500" />
              ) : (
                <Square size={18} className="text-slate-400" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {task.courseCode}
                </span>
                <span className="text-[11px] text-slate-400">Due {task.dueDate}</span>
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
