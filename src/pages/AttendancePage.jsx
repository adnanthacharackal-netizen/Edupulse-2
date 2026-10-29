// src/pages/AttendancePage.jsx
import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Calculator,
  PlusCircle,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { Lock, ShieldCheck } from 'lucide-react';

export default function AttendancePage() {
  const { subjects, attendanceStats, attendanceLogs, logAttendance } = useApp();
  const { isStaff } = useAuth();

  // Status Filter: 'all', 'safe', 'at-risk'
  const [filter, setFilter] = useState('all');

  // Attendance Calculator / Goal Simulator State
  const [targetPercent, setTargetPercent] = useState('75');
  const [calculatorError, setCalculatorError] = useState('');
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Log Class Attendance Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(subjects[0]?.code || '');
  const [selectedStatus, setSelectedStatus] = useState('Present');
  const [logError, setLogError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Course filter logic
  const filteredSubjects = subjects.filter((sub) => {
    const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
    if (filter === 'safe') return pct >= 75;
    if (filter === 'at-risk') return pct < 75;
    return true;
  });

  // Calculate target simulator
  const handleCalculateTarget = (e) => {
    e.preventDefault();
    setCalculatorError('');
    setCalculatorResult(null);

    const target = parseFloat(targetPercent);
    if (isNaN(target)) {
      setCalculatorError('Please enter a valid target percentage number.');
      return;
    }
    if (target <= 0 || target > 100) {
      setCalculatorError('Target percentage must be between 1% and 100%.');
      return;
    }

    const { totalAttended, totalHeld } = attendanceStats;
    const currentPct = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

    if (currentPct < target) {
      if (target === 100) {
        if (totalHeld > totalAttended) {
          setCalculatorResult({
            type: 'impossible',
            message:
              '100% attendance is mathematically impossible because you already have missed classes.',
          });
          return;
        }
      }
      // Formula: (totalAttended + x) / (totalHeld + x) >= target / 100
      // 100 * totalAttended + 100x = target * totalHeld + target * x
      // x * (100 - target) = target * totalHeld - 100 * totalAttended
      const required = Math.ceil(
        (target * totalHeld - 100 * totalAttended) / (100 - target)
      );

      setCalculatorResult({
        type: 'need_more',
        classesNeeded: Math.max(1, required),
        target: target,
      });
    } else {
      // Formula: totalAttended / (totalHeld + y) >= target / 100
      // y = floor((100 * totalAttended - target * totalHeld) / target)
      const canMiss = Math.floor(
        (100 * totalAttended - target * totalHeld) / target
      );

      setCalculatorResult({
        type: 'safe_buffer',
        classesCanMiss: Math.max(0, canMiss),
        target: target,
      });
    }
  };

  // Submit manual class attendance log
  const handleLogSubmit = (e) => {
    e.preventDefault();
    setLogError('');

    if (!selectedCourse) {
      setLogError('Please choose a course from the list.');
      return;
    }

    const isPresent = selectedStatus === 'Present';
    logAttendance(selectedCourse, isPresent);

    const sub = subjects.find((s) => s.code === selectedCourse);
    setSuccessToast(
      `Logged 1 ${selectedStatus.toLowerCase()} class for ${sub ? sub.name : selectedCourse}!`
    );
    setIsLogModalOpen(false);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="attendance-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Attendance Tracking & Eligibility</h1>
          <p className="page-main-desc">
            Monitor real-time session qualification, benchmark against university rules, and simulate targets.
          </p>
        </div>
        {isStaff ? (
          <button
            className="btn-primary-action"
            onClick={() => setIsLogModalOpen(true)}
          >
            <PlusCircle size={17} />
            <span>Log Class Attendance</span>
          </button>
        ) : (
          <div
            className="btn-restricted-pill"
            title="Official attendance recording is restricted to Authorized Staff"
          >
            <Lock size={15} />
            <span>Staff-Managed Records</span>
          </div>
        )}
      </div>

      {/* Role-Based Access Indicator */}
      <div className={`role-permission-banner ${isStaff ? 'banner-staff' : 'banner-student'}`}>
        {isStaff ? (
          <>
            <ShieldCheck size={16} className="text-blue-600" />
            <span>
              <strong>Authorized Staff Mode:</strong> You have permissions to record and modify official student attendance.
            </span>
          </>
        ) : (
          <>
            <Lock size={16} className="text-amber-600" />
            <span>
              <strong>Student Mode (Least-Privilege Access):</strong> You are viewing your own private records. Official attendance is recorded exclusively by authorized faculty & staff.
            </span>
          </>
        )}
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Statistical Metrics */}
      <div className="attendance-metric-grid">
        <div className="metric-box">
          <span className="metric-box-title">Aggregate Attendance</span>
          <div className="metric-box-num-row">
            <span className="metric-main-num">{attendanceStats.percentage}%</span>
            <span
              className={`metric-status-badge ${
                attendanceStats.isSafe ? 'badge-safe' : 'badge-danger'
              }`}
            >
              {attendanceStats.isSafe ? 'Eligible (>= 75%)' : 'Ineligible (< 75%)'}
            </span>
          </div>
          <span className="metric-box-sub">
            Calculated as ({attendanceStats.totalAttended} attended ÷ {attendanceStats.totalHeld} total held)
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-box-title">Attended Sessions</span>
          <div className="metric-box-num-row">
            <span className="metric-main-num text-blue-600">
              {attendanceStats.totalAttended}
            </span>
            <span className="metric-sub-num">of {attendanceStats.totalHeld} held</span>
          </div>
          <span className="metric-box-sub">Across all 5 enrolled registered courses</span>
        </div>

        <div className="metric-box">
          <span className="metric-box-title">Missed / Absent Sessions</span>
          <div className="metric-box-num-row">
            <span className="metric-main-num text-amber-600">
              {attendanceStats.totalMissed}
            </span>
            <span className="metric-sub-num">Classes</span>
          </div>
          <span className="metric-box-sub">
            {attendanceStats.isSafe
              ? 'Within permitted absence quota'
              : 'Immediate attendance recovery advised'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="attendance-content-grid">
        {/* Left Column: Course-by-Course Attendance Cards */}
        <div className="attendance-courses-col">
          <div className="dashboard-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Enrolled Course Breakdown</h3>
                <p className="card-subtitle">
                  Click "+ Present" or "+ Absent" to instantly record a session
                </p>
              </div>

              {/* Status Filter */}
              <div className="filter-button-group">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({subjects.length})
                </button>
                <button
                  className={`filter-btn ${filter === 'safe' ? 'active' : ''}`}
                  onClick={() => setFilter('safe')}
                >
                  Safe (≥75%)
                </button>
                <button
                  className={`filter-btn ${filter === 'at-risk' ? 'active' : ''}`}
                  onClick={() => setFilter('at-risk')}
                >
                  At Risk (&lt;75%)
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredSubjects.length === 0 ? (
              <EmptyState
                title={filter === 'at-risk' ? 'No Courses at Risk! 🎉' : 'No courses match this filter'}
                description={
                  filter === 'at-risk'
                    ? 'Congratulations! You are maintaining 75%+ attendance in all registered subjects.'
                    : 'Try clearing your filter to view all enrolled courses.'
                }
                actionLabel="Show All Courses"
                onAction={() => setFilter('all')}
              />
            ) : (
              <div className="course-attendance-cards-list">
                {filteredSubjects.map((sub) => {
                  const pct = sub.total > 0
                    ? Number(((sub.attended / sub.total) * 100).toFixed(1))
                    : 0;
                  const isWarning = pct < 75;

                  return (
                    <div
                      key={sub.code}
                      className={`course-att-card ${isWarning ? 'course-att-card-warning' : ''}`}
                    >
                      <div className="course-att-header">
                        <div>
                          <div className="course-code-row">
                            <span className="course-code-tag">{sub.code}</span>
                            <span className="course-credits-tag">{sub.credits} Credits</span>
                          </div>
                          <h4 className="course-att-title">{sub.name}</h4>
                          <span className="course-att-faculty">Instructor: {sub.faculty}</span>
                        </div>

                        <div className="course-att-stat-badge">
                          <span className="att-stat-num">{pct}%</span>
                          <span
                            className={`att-stat-pill ${
                              isWarning ? 'pill-warning' : 'pill-safe'
                            }`}
                          >
                            {isWarning ? 'Low Attendance' : 'Safe'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Track */}
                      <div className="progress-bar-wrapper">
                        <div className="attendance-track">
                          <div
                            className={`attendance-fill ${
                              isWarning ? 'fill-warning' : 'fill-primary'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                          <div
                            className="threshold-line"
                            style={{ left: '75%' }}
                            title="75% Minimum Requirement Benchmark"
                          />
                        </div>
                      </div>

                      <div className="course-att-footer">
                        <div className="course-att-counts">
                          <span>
                            Attended <strong>{sub.attended}</strong> of <strong>{sub.total}</strong> classes
                          </span>
                        </div>

                        {/* Quick Logging Buttons (Staff Only) */}
                        {isStaff ? (
                          <div className="quick-log-actions">
                            <button
                              className="btn-quick-log btn-quick-present"
                              onClick={() => logAttendance(sub.code, true)}
                              title="Record 1 Present class for this subject"
                            >
                              <Check size={14} /> + Present
                            </button>
                            <button
                              className="btn-quick-log btn-quick-absent"
                              onClick={() => logAttendance(sub.code, false)}
                              title="Record 1 Absent class for this subject"
                            >
                              <X size={14} /> + Absent
                            </button>
                          </div>
                        ) : (
                          <span
                            className="staff-only-pill"
                            title="Official attendance is recorded exclusively by authorized faculty & staff"
                          >
                            <Lock size={12} /> Verified by Faculty
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Simulator & Activity Log */}
        <div className="attendance-sidebar-col">
          {/* Target Attendance Calculator */}
          <div className="dashboard-card calculator-card">
            <div className="card-header-row">
              <div className="flex-title-row">
                <Calculator size={19} className="text-blue-600" />
                <h3 className="card-title">Attendance Simulator</h3>
              </div>
            </div>

            <p className="card-subtitle" style={{ marginBottom: '1rem' }}>
              Calculate how many classes you must attend or can safely miss to maintain your goal.
            </p>

            <form onSubmit={handleCalculateTarget} className="calculator-form">
              <div className="form-group">
                <label htmlFor="target-input" className="form-label">
                  Target Attendance Percentage (%)
                </label>
                <div className="input-group">
                  <input
                    id="target-input"
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    className={`form-input ${calculatorError ? 'form-input-error' : ''}`}
                    placeholder="e.g. 75, 80, 85"
                    value={targetPercent}
                    onChange={(e) => {
                      setTargetPercent(e.target.value);
                      setCalculatorError('');
                    }}
                  />
                  <button type="submit" className="calc-submit-btn">
                    Calculate
                  </button>
                </div>
                {calculatorError && (
                  <p className="form-error-msg">{calculatorError}</p>
                )}
              </div>
            </form>

            {/* Calculation Result */}
            {calculatorResult && (
              <div className="calculator-result-box">
                {calculatorResult.type === 'need_more' && (
                  <div className="calc-res calc-res-warning">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <div>
                      <h4 className="calc-res-title">
                        Attend the next <strong>{calculatorResult.classesNeeded}</strong> classes
                      </h4>
                      <p className="calc-res-text">
                        To reach your goal of <strong>{calculatorResult.target}%</strong>, you must attend{' '}
                        {calculatorResult.classesNeeded} consecutive sessions without any absence.
                      </p>
                    </div>
                  </div>
                )}

                {calculatorResult.type === 'safe_buffer' && (
                  <div className="calc-res calc-res-safe">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <div>
                      <h4 className="calc-res-title">
                        Safe Buffer: You can miss <strong>{calculatorResult.classesCanMiss}</strong> classes
                      </h4>
                      <p className="calc-res-text">
                        You can safely miss up to {calculatorResult.classesCanMiss} classes and still
                        remain above your <strong>{calculatorResult.target}%</strong> target.
                      </p>
                    </div>
                  </div>
                )}

                {calculatorResult.type === 'impossible' && (
                  <div className="calc-res calc-res-error">
                    <AlertTriangle size={18} className="text-rose-600" />
                    <div>
                      <p className="calc-res-text">{calculatorResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Attendance Logs */}
          <div className="dashboard-card logs-card">
            <h3 className="card-title">Recent Activity Logs</h3>
            <p className="card-subtitle" style={{ marginBottom: '0.85rem' }}>
              Recently recorded lecture and practical sessions
            </p>

            <div className="logs-list">
              {attendanceLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-item-left">
                    <span
                      className={`log-status-dot ${
                        log.status === 'Present' ? 'dot-present' : 'dot-absent'
                      }`}
                    />
                    <div>
                      <span className="log-course-name">{log.courseCode}</span>
                      <span className="log-date">{log.date}</span>
                    </div>
                  </div>
                  <span
                    className={`log-status-badge ${
                      log.status === 'Present' ? 'badge-safe' : 'badge-danger'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Log Attendance */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Class Attendance"
        subtitle="Record your attendance for a lecture or practical session"
      >
        <form onSubmit={handleLogSubmit} className="modal-form">
          {logError && <div className="form-error-banner">{logError}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="course-select">
              Select Enrolled Course <span className="required-star">*</span>
            </label>
            <select
              id="course-select"
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} — {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Session Status <span className="required-star">*</span>
            </label>
            <div className="radio-pill-group">
              <label className={`radio-pill ${selectedStatus === 'Present' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Present"
                  checked={selectedStatus === 'Present'}
                  onChange={() => setSelectedStatus('Present')}
                />
                <CheckCircle2 size={16} />
                <span>Present (+1 Class)</span>
              </label>

              <label className={`radio-pill ${selectedStatus === 'Absent' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Absent"
                  checked={selectedStatus === 'Absent'}
                  onChange={() => setSelectedStatus('Absent')}
                />
                <X size={16} />
                <span>Absent (Missed)</span>
              </label>
            </div>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => setIsLogModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-save">
              Save Attendance Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
