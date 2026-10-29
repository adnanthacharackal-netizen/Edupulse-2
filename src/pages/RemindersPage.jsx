// src/pages/RemindersPage.jsx
import React, { useState, useMemo } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  Clock,
  Calendar,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getBrowserNotificationPermission,
  getScheduledRemindersForAssignment,
  getDeadlineCountdown,
} from '../services/notificationService';
import Modal from '../components/common/Modal';

export default function RemindersPage() {
  const {
    assignments,
    reminders,
    notifications,
    notificationPreferences,
    updateAssignment,
    addReminder,
    toggleReminderEnabled,
    deleteReminder,
    testSoundChime,
    requestBrowserPermission,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState('alarms'); // 'alarms' | 'custom' | 'history'
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [browserPermission, setBrowserPermission] = useState(() =>
    getBrowserNotificationPermission()
  );

  // New Custom Reminder Form
  const [customForm, setCustomForm] = useState({
    title: '',
    category: 'Study',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    sound: true,
    repeat: 'Never',
    notes: '',
  });

  // Calculate all active scheduled assignment alarms
  const scheduledAssignmentAlarms = useMemo(() => {
    const list = [];
    assignments.forEach((asg) => {
      if (asg.status === 'Completed' || asg.status === 'Submitted') return;
      const scheduled = getScheduledRemindersForAssignment(asg);
      const countdown = getDeadlineCountdown(asg.dueDate, asg.dueTime);

      scheduled.forEach((item) => {
        list.push({
          ...item,
          assignmentStatus: asg.status,
          assignmentPriority: asg.priority,
          countdownText: countdown.text,
          isOverdue: countdown.isOverdue,
          enabled: asg.reminderEnabled,
        });
      });
    });

    // Sort by triggerTime ascending
    return list.sort((a, b) => a.triggerTime - b.triggerTime);
  }, [assignments]);

  const handleRequestPermission = async () => {
    const perm = await requestBrowserPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      setToastMsg('Browser notifications enabled successfully!');
    } else if (perm === 'denied') {
      setToastMsg('Permission denied in browser settings.');
    }
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddCustomReminder = (e) => {
    e.preventDefault();
    if (!customForm.title.trim()) return;

    addReminder({
      ...customForm,
      title: customForm.title.trim(),
    });

    setIsAddCustomOpen(false);
    setCustomForm({
      title: '',
      category: 'Study',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      sound: true,
      repeat: 'Never',
      notes: '',
    });

    setToastMsg('Custom reminder scheduled!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleAssignmentReminder = (assignmentId, currentVal) => {
    updateAssignment(assignmentId, { reminderEnabled: !currentVal });
    setToastMsg(`Reminder ${!currentVal ? 'enabled' : 'disabled'} for assignment.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const isCapacitorNative = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

  return (
    <div className="reminders-page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Alarms & Reminders Hub</h1>
          <p className="page-main-desc">
            Manage real-time assignment alarms, auditory deadline chimes, and custom academic reminders.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsAddCustomOpen(true)}
        >
          <PlusCircle size={16} />
          <span>New Custom Reminder</span>
        </button>
      </div>

      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* System Status Banner */}
      <div className="system-status-banner dashboard-card">
        <div className="status-grid">
          {/* Permission Status */}
          <div className="status-col">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={18} className="text-blue-500" />
              <h4 className="font-semibold text-sm">Browser Notifications</h4>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Status:{' '}
              <span
                className={`font-semibold ${
                  browserPermission === 'granted'
                    ? 'text-emerald-600'
                    : browserPermission === 'denied'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}
              >
                {browserPermission.toUpperCase()}
              </span>
            </p>
            {browserPermission !== 'granted' ? (
              <button
                className="btn-sm btn-outline-primary"
                onClick={handleRequestPermission}
              >
                Enable Notifications
              </button>
            ) : (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Active & Permitted
              </span>
            )}
          </div>

          {/* Sound Synthesizer */}
          <div className="status-col">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={18} className="text-amber-500" />
              <h4 className="font-semibold text-sm">Auditory Alarm Chime</h4>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Web Audio Synthesizer: {notificationPreferences.soundEnabled ? 'Enabled' : 'Muted'}
            </p>
            <button className="btn-sm btn-secondary flex items-center gap-1.5" onClick={testSoundChime}>
              <BellRing size={13} />
              <span>Test Chime</span>
            </button>
          </div>

          {/* Native Platform Bridge */}
          <div className="status-col">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={18} className="text-indigo-500" />
              <h4 className="font-semibold text-sm">Platform Delivery</h4>
            </div>
            <p className="text-xs text-slate-500">
              {isCapacitorNative
                ? 'Capacitor Android Native Channel active (Exact alarms supported)'
                : 'Web App Engine (Live in-app ticker + Web Notifications API)'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reminders-tabs-bar">
        <button
          className={`reminders-tab ${activeTab === 'alarms' ? 'active' : ''}`}
          onClick={() => setActiveTab('alarms')}
        >
          <Bell size={16} />
          <span>Assignment Alarms ({scheduledAssignmentAlarms.length})</span>
        </button>
        <button
          className={`reminders-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <Clock size={16} />
          <span>Custom Reminders ({reminders.length})</span>
        </button>
        <button
          className={`reminders-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <RotateCcw size={16} />
          <span>Notification History ({notifications.length})</span>
        </button>
      </div>

      {/* Tab 1: Assignment Alarms */}
      {activeTab === 'alarms' && (
        <div className="tab-panel">
          <div className="dashboard-card mb-4">
            <h3 className="card-title mb-2">Active Scheduled Assignment Alarms</h3>
            <p className="text-xs text-slate-500">
              These alarms are automatically calculated from your assignment deadlines and reminder interval settings (e.g. 7 days, 1 day, 2 hours, 30 mins before, and at exact deadline).
            </p>
          </div>

          {scheduledAssignmentAlarms.length === 0 ? (
            <div className="empty-state-box dashboard-card text-center p-8">
              <BellRing size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500">No active assignment alarms scheduled.</p>
            </div>
          ) : (
            <div className="alarms-grid">
              {scheduledAssignmentAlarms.map((alarm, idx) => {
                const triggerStr = new Date(alarm.triggerTime).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={`${alarm.assignmentId}-${alarm.intervalKey}-${idx}`}
                    className={`alarm-card dashboard-card ${
                      alarm.isOverdue ? 'alarm-card-overdue' : ''
                    }`}
                  >
                    <div className="alarm-header-row">
                      <div className="flex items-center gap-2">
                        <span className="task-chip chip-course">{alarm.courseCode}</span>
                        <span className={`task-chip chip-priority priority-${alarm.assignmentPriority.toLowerCase()}`}>
                          {alarm.assignmentPriority}
                        </span>
                      </div>
                      <button
                        className={`alarm-toggle-btn ${alarm.enabled ? 'active' : ''}`}
                        onClick={() =>
                          handleToggleAssignmentReminder(alarm.assignmentId, alarm.enabled)
                        }
                        title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                      >
                        {alarm.enabled ? 'Alarm ON' : 'Alarm OFF'}
                      </button>
                    </div>

                    <h4 className="alarm-title">{alarm.assignmentTitle}</h4>

                    <div className="alarm-trigger-box">
                      <Clock size={14} className="text-blue-500" />
                      <span>Triggers: <strong>{alarm.label}</strong></span>
                    </div>

                    <div className="alarm-time-meta">
                      <span className="alarm-time-date">Scheduled for: {triggerStr}</span>
                      <span className={`alarm-countdown ${alarm.isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
                        {alarm.countdownText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Custom Reminders */}
      {activeTab === 'custom' && (
        <div className="tab-panel">
          <div className="custom-reminders-grid">
            {reminders.length === 0 ? (
              <div className="empty-state-box dashboard-card text-center p-8 col-span-2">
                <Clock size={36} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500">No custom reminders yet. Add one to track personal study goals.</p>
              </div>
            ) : (
              reminders.map((rem) => (
                <div key={rem.id} className="custom-rem-card dashboard-card">
                  <div className="custom-rem-header">
                    <span className="task-chip chip-course">{rem.category}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className={`alarm-toggle-btn ${rem.enabled ? 'active' : ''}`}
                        onClick={() => toggleReminderEnabled(rem.id)}
                      >
                        {rem.enabled ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        className="task-action-btn delete"
                        onClick={() => deleteReminder(rem.id)}
                        title="Delete reminder"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="custom-rem-title">{rem.title}</h4>

                  <div className="custom-rem-meta">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {rem.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {rem.time}
                    </span>
                    {rem.sound && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Volume2 size={13} /> Chime
                      </span>
                    )}
                  </div>

                  {rem.notes && (
                    <p className="custom-rem-notes text-xs text-slate-500 mt-2">
                      {rem.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: History & Notification Center Log */}
      {activeTab === 'history' && (
        <div className="tab-panel">
          <div className="dashboard-card mb-4 flex items-center justify-between">
            <h3 className="card-title">Notification Center History</h3>
            <div className="flex items-center gap-2">
              <button className="btn-sm btn-secondary" onClick={markAllNotificationsRead}>
                Mark All Read
              </button>
              <button className="btn-sm btn-danger" onClick={clearNotifications}>
                Clear History
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state-box dashboard-card text-center p-8">
              <CheckCircle2 size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500">Notification center is empty.</p>
            </div>
          ) : (
            <div className="notification-history-list dashboard-card">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-history-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className="notif-history-icon">
                    {notif.type === 'overdue' ? (
                      <AlertTriangle size={18} className="text-rose-500" />
                    ) : (
                      <BellRing size={18} className="text-blue-500" />
                    )}
                  </div>
                  <div className="notif-history-body">
                    <div className="flex items-center justify-between">
                      <h4 className="notif-history-title">{notif.title}</h4>
                      <span className="notif-history-time">{notif.timestamp}</span>
                    </div>
                    <p className="notif-history-msg">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Custom Reminder Modal */}
      {isAddCustomOpen && (
        <Modal
          isOpen={isAddCustomOpen}
          onClose={() => setIsAddCustomOpen(false)}
          title="Create Custom Academic Reminder"
        >
          <form onSubmit={handleAddCustomReminder} className="modal-form">
            <div className="form-group">
              <label className="form-label">Reminder Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Return Library Books, Prepare Lab Samples, Register for Spring..."
                value={customForm.title}
                onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={customForm.category}
                  onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                >
                  <option value="Study">Study Session</option>
                  <option value="Academic">Academic Deadlines</option>
                  <option value="Advising">Advisor Meetings</option>
                  <option value="Library">Library & Books</option>
                  <option value="General">General Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Repeat</label>
                <select
                  className="form-select"
                  value={customForm.repeat}
                  onChange={(e) => setCustomForm({ ...customForm, repeat: e.target.value })}
                >
                  <option value="Never">Never (One-time)</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={customForm.date}
                  onChange={(e) => setCustomForm({ ...customForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={customForm.time}
                  onChange={(e) => setCustomForm({ ...customForm, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={customForm.sound}
                  onChange={(e) => setCustomForm({ ...customForm, sound: e.target.checked })}
                />
                <span>Play audible sound chime when reminder fires</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Instructions (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Extra details..."
                value={customForm.notes}
                onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddCustomOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Schedule Reminder
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
