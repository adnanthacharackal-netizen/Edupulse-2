// src/pages/AssignmentsPage.jsx
import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Bell,
  BellRing,
  AlertTriangle,
  FileText,
  User,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineCountdown, REMINDER_INTERVAL_LABELS } from '../services/notificationService';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

const statusOptions = ['All', 'Not Started', 'In Progress', 'Submitted', 'Completed', 'Overdue'];
const priorityOptions = ['All', 'Urgent', 'High', 'Medium', 'Low'];
const sortOptions = [
  { value: 'deadline', label: 'Nearest Deadline' },
  { value: 'priority', label: 'Highest Priority' },
  { value: 'title', label: 'Title (A-Z)' },
];

const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const defaultIntervalsList = ['7d', '3d', '1d', '2h', '30m', 'due'];

export default function AssignmentsPage() {
  const {
    assignments,
    addAssignment,
    updateAssignment,
    updateAssignmentStatus,
    deleteAssignment,
  } = useApp();

  // Filters, Search & Sort
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    courseCode: 'CS 301',
    courseName: 'Database Systems',
    teacherName: 'Prof. Michael Chang',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dueTime: '23:59',
    priority: 'Medium',
    status: 'In Progress',
    points: 100,
    submissionType: 'File Upload (PDF/ZIP)',
    notes: '',
    attachmentLink: '',
    reminders: ['1d', '2h', 'due'],
    reminderEnabled: true,
    recurringStudy: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // Summary counts
  const totalCount = assignments.length;
  const pendingCount = assignments.filter(
    (a) => a.status === 'In Progress' || a.status === 'Not Started'
  ).length;
  const completedCount = assignments.filter(
    (a) => a.status === 'Completed' || a.status === 'Submitted'
  ).length;

  const overdueCount = useMemo(() => {
    const now = Date.now();
    return assignments.filter((a) => {
      if (a.status === 'Completed' || a.status === 'Submitted') return false;
      const cd = getDeadlineCountdown(a.dueDate, a.dueTime);
      return cd.isOverdue;
    }).length;
  }, [assignments]);

  // Unique course codes for filter dropdown
  const availableSubjects = useMemo(() => {
    const codes = Array.from(new Set(assignments.map((a) => a.courseCode).filter(Boolean)));
    return ['All', ...codes];
  }, [assignments]);

  // Filtered & Sorted Assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        // Overdue status check
        const countdown = getDeadlineCountdown(item.dueDate, item.dueTime);
        const itemIsOverdue =
          countdown.isOverdue && item.status !== 'Completed' && item.status !== 'Submitted';

        if (selectedStatus === 'Overdue') {
          if (!itemIsOverdue) return false;
        } else if (selectedStatus !== 'All' && item.status !== selectedStatus) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'All' && item.priority !== selectedPriority) {
          return false;
        }

        // Subject filter
        if (selectedSubject !== 'All' && item.courseCode !== selectedSubject) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchCourse =
            (item.courseCode || '').toLowerCase().includes(q) ||
            (item.courseName || '').toLowerCase().includes(q);
          const matchTeacher = (item.teacherName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCourse && !matchTeacher) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          const dueA = `${a.dueDate} ${a.dueTime}`;
          const dueB = `${b.dueDate} ${b.dueTime}`;
          return dueA.localeCompare(dueB);
        }
        if (sortBy === 'priority') {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [assignments, selectedStatus, selectedPriority, selectedSubject, searchQuery, sortBy]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormErrors({});
    setFormData({
      title: '',
      courseCode: 'CS 301',
      courseName: 'Database Systems',
      teacherName: 'Prof. Michael Chang',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      dueTime: '23:59',
      priority: 'Medium',
      status: 'In Progress',
      points: 100,
      submissionType: 'File Upload (PDF/ZIP)',
      notes: '',
      attachmentLink: '',
      reminders: ['1d', '2h', 'due'],
      reminderEnabled: true,
      recurringStudy: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg) => {
    setEditingId(asg.id);
    setFormErrors({});
    setFormData({
      title: asg.title || '',
      courseCode: asg.courseCode || 'CS 301',
      courseName: asg.courseName || 'Database Systems',
      teacherName: asg.teacherName || '',
      assignedDate: asg.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: asg.dueDate || '',
      dueTime: asg.dueTime || '23:59',
      priority: asg.priority || 'Medium',
      status: asg.status || 'In Progress',
      points: asg.points || 100,
      submissionType: asg.submissionType || 'File Upload (PDF/ZIP)',
      notes: asg.notes || '',
      attachmentLink: asg.attachmentLink || '',
      reminders: Array.isArray(asg.reminders) ? asg.reminders : ['1d', '2h', 'due'],
      reminderEnabled: asg.reminderEnabled !== undefined ? asg.reminderEnabled : true,
      recurringStudy: Boolean(asg.recurringStudy),
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Assignment title is required.';
    }
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      updateAssignment(editingId, { ...formData });
      setToastMsg(`Assignment "${formData.title}" updated!`);
    } else {
      addAssignment({ ...formData });
      setToastMsg(`Assignment "${formData.title}" created with reminder alarms!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? All scheduled alarms will be cancelled.`)) {
      deleteAssignment(id);
      setToastMsg(`Deleted assignment "${title}".`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const toggleInterval = (key) => {
    setFormData((prev) => {
      const exists = prev.reminders.includes(key);
      const updated = exists
        ? prev.reminders.filter((k) => k !== key)
        : [...prev.reminders, key];
      return { ...prev, reminders: updated };
    });
  };

  return (
    <div className="assignments-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Assignment Management</h1>
          <p className="page-main-desc">
            Organize coursework, schedule multiple deadline alarms, and submit before cutoff dates.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreate}>
          <PlusCircle size={16} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Success Notification */}
      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Overview Stat Counters */}
      <div className="asg-summary-grid">
        <div className="asg-summary-card">
          <span className="asg-summary-label">Total Assignments</span>
          <span className="asg-summary-val">{totalCount}</span>
        </div>
        <div className="asg-summary-card">
          <span className="asg-summary-label">Pending / In Progress</span>
          <span className="asg-summary-val text-blue-600">{pendingCount}</span>
        </div>
        <div className="asg-summary-card">
          <span className="asg-summary-label">Completed / Submitted</span>
          <span className="asg-summary-val text-emerald-600">{completedCount}</span>
        </div>
        <div className="asg-summary-card">
          <span className="asg-summary-label">Overdue</span>
          <span className="asg-summary-val text-rose-600">{overdueCount}</span>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="dashboard-card filters-control-card">
        <div className="asg-controls-row">
          <div className="asg-search-box flex-1">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, subject, professor, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select w-36"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Subjects' : s}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="form-select w-36"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : `${p} Priority`}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select w-44"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs-row">
          <span className="status-tabs-label">Status:</span>
          <div className="status-tabs-list">
            {statusOptions.map((st) => (
              <button
                key={st}
                className={`status-tab-btn ${selectedStatus === st ? 'active' : ''}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st}
                <span className="tab-count-bubble">
                  {st === 'All'
                    ? assignments.length
                    : st === 'Overdue'
                    ? overdueCount
                    : assignments.filter((a) => a.status === st).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments match your criteria"
          description="Try clearing search filters or create a new assignment."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedStatus('All');
            setSelectedPriority('All');
            setSelectedSubject('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="assignments-cards-grid">
          {filteredAssignments.map((item) => {
            const isCompleted = item.status === 'Completed' || item.status === 'Submitted';
            const countdown = getDeadlineCountdown(item.dueDate, item.dueTime);
            const isOverdue = countdown.isOverdue && !isCompleted;

            return (
              <div
                key={item.id}
                className={`assignment-page-card priority-border-${item.priority.toLowerCase()} ${
                  isCompleted ? 'asg-card-submitted' : ''
                } ${isOverdue ? 'asg-card-overdue' : ''}`}
              >
                {/* Top Row: Course + Badges */}
                <div className="asg-card-top-row">
                  <div className="asg-code-name">
                    <span className="asg-code">{item.courseCode}</span>
                    <span className="asg-name">• {item.courseName}</span>
                  </div>

                  <div className="asg-badges-group">
                    <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                    <span
                      className={`asg-status-badge status-${item.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="asg-card-title">{item.title}</h3>

                {/* Description & Professor */}
                {item.notes && <p className="asg-card-notes">{item.notes}</p>}

                <div className="asg-teacher-row">
                  {item.teacherName && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User size={12} />
                      Instructor: {item.teacherName}
                    </span>
                  )}
                  {item.attachmentLink && (
                    <a
                      href={item.attachmentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="asg-link-badge"
                    >
                      <ExternalLink size={12} />
                      Reference Material
                    </a>
                  )}
                </div>

                {/* Deadlines & Live Countdown */}
                <div className="asg-card-meta">
                  <div className="asg-info-item">
                    <Calendar size={14} className="asg-info-icon" />
                    <span>
                      Due: {item.dueDate} at {item.dueTime}
                    </span>
                  </div>
                  <div className="asg-info-item">
                    <Clock
                      size={14}
                      className={isOverdue ? 'text-rose-600' : 'text-amber-600'}
                    />
                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'asg-days-left'}>
                      {countdown.text}
                    </span>
                  </div>
                </div>

                {/* Reminders Pill */}
                {item.reminderEnabled && (
                  <div className="asg-alarm-indicator">
                    <BellRing size={13} className="text-blue-500" />
                    <span>
                      Alarms:{' '}
                      {Array.isArray(item.reminders) && item.reminders.length > 0
                        ? item.reminders.map((k) => REMINDER_INTERVAL_LABELS[k] || k).join(', ')
                        : 'At deadline'}
                    </span>
                  </div>
                )}

                {/* Footer: Points + Action Buttons */}
                <div className="asg-card-footer-row">
                  <div className="asg-points-info">
                    <span className="asg-points">{item.points} pts</span>
                    <span className="asg-type-tag">{item.submissionType}</span>
                  </div>

                  <div className="asg-card-actions">
                    {/* Status Dropdown */}
                    <select
                      className="form-select form-select-sm"
                      value={item.status}
                      onChange={(e) => updateAssignmentStatus(item.id, e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      className="task-action-btn edit"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit assignment & alarms"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      className="task-action-btn delete"
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete assignment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Assignment & Alarms' : 'Create Assignment & Alarms'}
          subtitle="Configure assignment instructions, due date, and automated reminder intervals"
        >
          <form onSubmit={handleFormSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="asg-title">
                Assignment Title <span className="required-star">*</span>
              </label>
              <input
                id="asg-title"
                type="text"
                placeholder="e.g. B-Tree Balancing Theorems"
                className={`form-input ${formErrors.title ? 'form-input-error' : ''}`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Course Code & Subject</label>
                <select
                  className="form-select"
                  value={formData.courseCode}
                  onChange={(e) => {
                    const map = {
                      'CS 301': 'Database Systems',
                      'CS 310': 'Data Structures & Algorithms',
                      'MATH 240': 'Linear Algebra',
                      'CS 335': 'Web Applications Engineering',
                      'HUM 120': 'Technical Communication & Ethics',
                    };
                    setFormData({
                      ...formData,
                      courseCode: e.target.value,
                      courseName: map[e.target.value] || 'General Subject',
                    });
                  }}
                >
                  <option value="CS 301">CS 301 - Database Systems</option>
                  <option value="CS 310">CS 310 - Algorithms</option>
                  <option value="MATH 240">MATH 240 - Linear Algebra</option>
                  <option value="CS 335">CS 335 - Web Applications</option>
                  <option value="HUM 120">HUM 120 - Tech Communication</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Teacher / Faculty Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prof. Michael Chang"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Urgent">Urgent Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Points / Max Score</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="form-input"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Due Date <span className="required-star">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Time (24h or AM/PM)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="23:59 or 11:59 PM"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reference Material / Attachment Link</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/... or Google Drive link"
                value={formData.attachmentLink}
                onChange={(e) => setFormData({ ...formData, attachmentLink: e.target.value })}
              />
            </div>

            {/* Alarm & Reminder Settings Section */}
            <div className="asg-alarm-config-section">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BellRing size={16} className="text-blue-500" />
                  <label className="font-semibold text-sm">Automated Deadline Alarms</label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.reminderEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, reminderEnabled: e.target.checked })
                    }
                  />
                  <span>Enable Alarms for this Assignment</span>
                </label>
              </div>

              {formData.reminderEnabled && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Select reminder triggers before the cutoff time:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {defaultIntervalsList.map((key) => {
                      const isChecked = formData.reminders.includes(key);
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isChecked
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 font-semibold text-blue-700 dark:text-blue-300'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleInterval(key)}
                          />
                          <span>{REMINDER_INTERVAL_LABELS[key] || key}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recurringStudy}
                        onChange={(e) =>
                          setFormData({ ...formData, recurringStudy: e.target.checked })
                        }
                      />
                      <span>Schedule daily recurring revision nudge until submission</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Instructions & Rubric Notes</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Professor instructions, deliverables list, submission guidelines..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
