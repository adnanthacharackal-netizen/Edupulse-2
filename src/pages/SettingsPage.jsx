// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import {
  User,
  Bell,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Volume2,
  BellRing,
  Globe,
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getBrowserNotificationPermission,
  REMINDER_INTERVAL_LABELS,
} from '../services/notificationService';

const allIntervalOptions = ['7d', '3d', '1d', '2h', '30m', 'due'];

export default function SettingsPage() {
  const {
    student,
    setStudent,
    notificationPreferences,
    setNotificationPreferences,
    theme,
    toggleTheme,
    testSoundChime,
    requestBrowserPermission,
    assignments,
    tasks,
    notes,
    calendarEvents,
  } = useApp();

  const [formData, setFormData] = useState({
    name: student.name || 'Alex Morgan',
    preferredName: student.preferredName || 'Alex',
    studentId: student.id || 'STU-2024-8842',
    email: student.email || 'alex.morgan@university.edu',
    major: student.major || 'B.S. Computer Science',
    department: student.department || 'School of Engineering',
    academicAdvisor: student.academicAdvisor || 'Dr. Evelyn Reed',
    semester: student.semester || 'Semester 5 (Fall 2026)',
  });

  const [browserPermission, setBrowserPermission] = useState(() =>
    getBrowserNotificationPermission()
  );

  const [successToast, setSuccessToast] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    setStudent((prev) => ({
      ...prev,
      name: formData.name,
      preferredName: formData.preferredName,
      id: formData.studentId,
      email: formData.email,
      major: formData.major,
      department: formData.department,
      academicAdvisor: formData.academicAdvisor,
      semester: formData.semester,
    }));
    setSuccessToast('Student profile details saved!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleToggleDefaultInterval = (key) => {
    const current = notificationPreferences.defaultIntervals || ['1d', '2h', 'due'];
    const exists = current.includes(key);
    const updated = exists ? current.filter((k) => k !== key) : [...current, key];

    setNotificationPreferences((prev) => ({
      ...prev,
      defaultIntervals: updated,
    }));
    setSuccessToast('Default reminder intervals updated!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleToggleSound = (checked) => {
    setNotificationPreferences((prev) => ({ ...prev, soundEnabled: checked }));
  };

  const handleToggleOverdue = (checked) => {
    setNotificationPreferences((prev) => ({ ...prev, autoOverdueAlerts: checked }));
  };

  const handleRequestPermission = async () => {
    const res = await requestBrowserPermission();
    setBrowserPermission(res);
    if (res === 'granted') {
      setSuccessToast('Browser notifications enabled!');
    } else {
      setSuccessToast('Permission denied in browser settings.');
    }
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleExportData = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      student,
      assignments,
      tasks,
      notes,
      calendarEvents,
      notificationPreferences,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessToast('Student productivity data exported as JSON!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all data back to original demo state? This will clear locally customized assignments and tasks.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Profile & Hub Settings</h1>
          <p className="page-main-desc">
            Manage your personal student details, deadline alarm preferences, appearance, and data storage.
          </p>
        </div>
      </div>

      {successToast && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Settings */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div className="flex-title-row">
              <User size={19} className="text-blue-600" />
              <h3 className="card-title">Student Profile Information</h3>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="modal-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Official Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Greeting Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Student ID Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institutional Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Degree Major</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Academic Semester</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Advisor</label>
              <input
                type="text"
                className="form-input"
                value={formData.academicAdvisor}
                onChange={(e) => setFormData({ ...formData, academicAdvisor: e.target.value })}
              />
            </div>

            <div className="text-right mt-4">
              <button type="submit" className="btn-primary flex items-center gap-2 ml-auto">
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Appearance & Theme Card */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div className="flex-title-row">
              {theme === 'dark' ? (
                <Moon size={19} className="text-indigo-400" />
              ) : (
                <Sun size={19} className="text-amber-500" />
              )}
              <h3 className="card-title">Theme & Appearance</h3>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            Toggle between clean crisp Light Mode or high-contrast Dark Mode for late-night study sessions.
          </p>

          <div className="theme-toggle-container">
            <div
              className={`theme-option-box ${theme === 'light' ? 'selected' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              <Sun size={24} className="text-amber-500 mb-2" />
              <span className="font-semibold text-sm">Light Mode</span>
              <span className="text-xs text-slate-400">Crisp daytime readability</span>
            </div>

            <div
              className={`theme-option-box ${theme === 'dark' ? 'selected' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              <Moon size={24} className="text-indigo-400 mb-2" />
              <span className="font-semibold text-sm">Dark Mode</span>
              <span className="text-xs text-slate-400">Eye-friendly for night prep</span>
            </div>
          </div>
        </div>

        {/* Notification & Alarm Preferences */}
        <div className="dashboard-card col-span-1 lg:col-span-2">
          <div className="card-header-row">
            <div className="flex-title-row">
              <BellRing size={19} className="text-blue-600" />
              <h3 className="card-title">Deadline Alarm & Notification Preferences</h3>
            </div>
          </div>

          <div className="settings-notif-grid">
            {/* Browser Permission Row */}
            <div className="toggle-item-card">
              <div className="flex items-start gap-3">
                <Globe size={20} className="text-blue-500 mt-1" />
                <div>
                  <span className="toggle-title">System Browser Notifications</span>
                  <p className="toggle-desc">
                    Display desktop/mobile OS notifications when assignment deadlines approach.
                  </p>
                  <p className="text-xs mt-1">
                    Permission status:{' '}
                    <strong
                      className={
                        browserPermission === 'granted'
                          ? 'text-emerald-600'
                          : browserPermission === 'denied'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }
                    >
                      {browserPermission.toUpperCase()}
                    </strong>
                  </p>
                </div>
              </div>
              <div>
                {browserPermission !== 'granted' ? (
                  <button className="btn-sm btn-outline-primary" onClick={handleRequestPermission}>
                    Request Permission
                  </button>
                ) : (
                  <span className="badge-positive text-xs py-1 px-2.5 rounded-full font-semibold">
                    Enabled
                  </span>
                )}
              </div>
            </div>

            {/* Audio Chime Row */}
            <div className="toggle-item-card">
              <div className="flex items-start gap-3">
                <Volume2 size={20} className="text-amber-500 mt-1" />
                <div>
                  <span className="toggle-title">Audible Alarm Chime</span>
                  <p className="toggle-desc">
                    Plays a gentle synthesizer chime (Web Audio API) when an assignment reminder triggers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-sm btn-secondary" onClick={testSoundChime}>
                  Test Sound
                </button>
                <input
                  type="checkbox"
                  checked={notificationPreferences.soundEnabled}
                  onChange={(e) => handleToggleSound(e.target.checked)}
                />
              </div>
            </div>

            {/* Overdue Alerts */}
            <div className="toggle-item-card">
              <div className="flex items-start gap-3">
                <Bell size={20} className="text-rose-500 mt-1" />
                <div>
                  <span className="toggle-title">Automatic Overdue Deadline Alerts</span>
                  <p className="toggle-desc">
                    Warn immediately if an assignment deadline passes without being marked Submitted or Completed.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences.autoOverdueAlerts}
                onChange={(e) => handleToggleOverdue(e.target.checked)}
              />
            </div>

            {/* Default Intervals */}
            <div className="default-intervals-card">
              <h4 className="font-semibold text-sm mb-1">
                Default Reminder Intervals for New Assignments
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                When you create a new assignment, these intervals will be pre-selected:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allIntervalOptions.map((key) => {
                  const isChecked = (notificationPreferences.defaultIntervals || []).includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 font-semibold text-blue-700 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDefaultInterval(key)}
                      />
                      <span>{REMINDER_INTERVAL_LABELS[key] || key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Data Persistence & Storage */}
        <div className="dashboard-card col-span-1 lg:col-span-2">
          <div className="card-header-row">
            <div className="flex-title-row">
              <Database size={19} className="text-indigo-600" />
              <h3 className="card-title">Data Backup & Local Persistence</h3>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            EduPulse stores your productivity data in your browser's local persistent storage, allowing full offline operation. You can also export a JSON backup or reset to factory sample data.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn-secondary flex items-center gap-2" onClick={handleExportData}>
              <Download size={15} />
              <span>Export All Data (JSON)</span>
            </button>
            <button className="btn-danger flex items-center gap-2" onClick={handleResetData}>
              <RotateCcw size={15} />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
