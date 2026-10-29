// src/pages/TasksPage.jsx
import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  PlusCircle,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

const categories = ['All', 'Study', 'Homework', 'Project', 'Reading', 'Review'];
const priorities = ['All', 'Urgent', 'High', 'Medium', 'Low'];

export default function TasksPage() {
  const { tasks, addTask, updateTask, toggleTaskCompleted, deleteTask } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Quick inline task input
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCourse, setQuickCourse] = useState('CS 301');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [quickDueDate, setQuickDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Modal for Edit
  const [editingTask, setEditingTask] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter === 'active' && t.completed) return false;
      if (statusFilter === 'completed' && !t.completed) return false;
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.courseCode.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, selectedCategory, selectedPriority, searchQuery]);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      courseCode: quickCourse,
      priority: quickPriority,
      dueDate: quickDueDate,
      category: 'Study',
    });

    setQuickTitle('');
    setToastMsg('Task added to your study plan!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteTask(id);
      setToastMsg('Task removed.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    updateTask(editingTask.id, {
      title: editingTask.title.trim(),
      courseCode: editingTask.courseCode,
      priority: editingTask.priority,
      category: editingTask.category,
      dueDate: editingTask.dueDate,
    });

    setEditingTask(null);
    setToastMsg('Task updated!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="tasks-page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">My Tasks & Study Plan</h1>
          <p className="page-main-desc">
            Organize your daily study sessions, track homework assignments, and keep your prep on schedule.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="tasks-progress-card dashboard-card">
        <div className="tasks-progress-header">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <h3 className="card-title">Today's Study Progress</h3>
          </div>
          <span className="tasks-progress-badge">
            {completedCount} of {totalCount} completed ({progressPercent}%)
          </span>
        </div>
        <div className="tasks-progress-track">
          <div
            className="tasks-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="tasks-progress-caption">
          {progressPercent === 100
            ? '🎉 Great job! You have completed all scheduled tasks for today!'
            : progressPercent >= 50
            ? '🔥 You are making steady progress today. Keep pushing!'
            : '📝 Get started by checking off your top study priorities.'}
        </p>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="quick-add-task-form dashboard-card">
        <div className="quick-task-row">
          <input
            type="text"
            className="form-input flex-1"
            placeholder="Add a new study task (e.g. 'Solve Linear Algebra problems #10-#15')..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            required
          />
          <select
            className="form-select w-36"
            value={quickCourse}
            onChange={(e) => setQuickCourse(e.target.value)}
          >
            <option value="CS 301">CS 301</option>
            <option value="CS 310">CS 310</option>
            <option value="MATH 240">MATH 240</option>
            <option value="CS 335">CS 335</option>
            <option value="HUM 120">HUM 120</option>
            <option value="General">General</option>
          </select>
          <select
            className="form-select w-32"
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
          >
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            className="form-input w-40"
            value={quickDueDate}
            onChange={(e) => setQuickDueDate(e.target.value)}
          />
          <button type="submit" className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
            <PlusCircle size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Filter Toolbar */}
      <div className="tasks-filter-bar">
        {/* Status Pills */}
        <div className="filter-pill-group">
          <button
            className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({completedCount})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
        </div>

        {/* Category Pills */}
        <div className="filter-pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="task-list-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state-box dashboard-card text-center p-8">
            <CheckCircle2 size={40} className="mx-auto text-slate-400 mb-2" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">No tasks found</h4>
            <p className="text-slate-500 text-sm">
              {statusFilter === 'active'
                ? 'All caught up! No active tasks matching your filter.'
                : 'No tasks recorded in this category.'}
            </p>
          </div>
        ) : (
          <div className="task-items-grid">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`task-card dashboard-card ${task.completed ? 'task-card-completed' : ''}`}
              >
                <button
                  className="task-checkbox-btn"
                  onClick={() => toggleTaskCompleted(task.id)}
                  title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.completed ? (
                    <CheckSquare size={22} className="text-emerald-500" />
                  ) : (
                    <Square size={22} className="text-slate-400 hover:text-blue-500" />
                  )}
                </button>

                <div className="task-body">
                  <p className={`task-title ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  <div className="task-meta-row">
                    <span className="task-chip chip-course">{task.courseCode}</span>
                    <span className={`task-chip chip-priority priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className="task-meta-date">
                      <Calendar size={13} />
                      {task.dueDate}
                    </span>
                    {task.category && (
                      <span className="task-meta-category">
                        <Tag size={12} />
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="task-action-btn edit"
                    onClick={() => setEditingTask({ ...task })}
                    title="Edit task"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="task-action-btn delete"
                    onClick={() => handleDelete(task.id, task.title)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <Modal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          title="Edit Study Task"
        >
          <form onSubmit={handleSaveEdit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                className="form-input"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                required
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Subject / Course</label>
                <select
                  className="form-select"
                  value={editingTask.courseCode}
                  onChange={(e) => setEditingTask({ ...editingTask, courseCode: e.target.value })}
                >
                  <option value="CS 301">CS 301</option>
                  <option value="CS 310">CS 310</option>
                  <option value="MATH 240">MATH 240</option>
                  <option value="CS 335">CS 335</option>
                  <option value="HUM 120">HUM 120</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
