// src/components/dashboard/AttendanceBreakdown.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function AttendanceBreakdown() {
  const { subjects, attendanceStats } = useApp();
  const navigate = useNavigate();

  return (
    <div className="dashboard-card attendance-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Subject Attendance</h3>
          <p className="card-subtitle">Minimum 75% required for exam qualification</p>
        </div>
        <div
          className={
            attendanceStats.isSafe ? 'attendance-pill-safe' : 'attendance-pill-danger'
          }
        >
          {attendanceStats.isSafe ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>
            {attendanceStats.isSafe ? 'Qualified' : 'Action Needed'} ({attendanceStats.percentage}%)
          </span>
        </div>
      </div>

      {/* Mini summary alert */}
      <div className={`attendance-alert-box ${!attendanceStats.isSafe ? 'alert-box-warning' : ''}`}>
        <Sparkles size={16} className={attendanceStats.isSafe ? 'text-blue-600' : 'text-amber-600'} />
        <p className="alert-box-text">
          {attendanceStats.isSafe ? (
            <>
              Total classes attended: <strong>{attendanceStats.totalAttended}</strong> /{' '}
              <strong>{attendanceStats.totalHeld}</strong>. You are safely above the minimum benchmark.
            </>
          ) : (
            <>
              Warning: Current aggregate is <strong>{attendanceStats.percentage}%</strong>. Check below
              to see which course needs immediate attendance recovery.
            </>
          )}
        </p>
      </div>

      <div className="subjects-attendance-list">
        {subjects.map((subject) => {
          const percentage = subject.total > 0
            ? Number(((subject.attended / subject.total) * 100).toFixed(1))
            : 0;
          const isWarning = percentage < 75;

          return (
            <div key={subject.code} className="subject-item">
              <div className="subject-item-top">
                <div className="subject-meta">
                  <span className="subject-code">{subject.code}</span>
                  <span className="subject-name">{subject.name}</span>
                </div>
                <div className="subject-stats">
                  <span className="attended-count">
                    {subject.attended}/{subject.total} classes
                  </span>
                  <span
                    className={`subject-percent-badge ${
                      isWarning ? 'percent-warning' : 'percent-safe'
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar with 75% marker */}
              <div className="progress-bar-wrapper">
                <div className="attendance-track">
                  <div
                    className={`attendance-fill ${
                      isWarning ? 'fill-warning' : 'fill-primary'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  <div
                    className="threshold-line"
                    style={{ left: '75%' }}
                    title="75% Minimum Requirement Benchmark"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-footer-action">
        <button
          className="link-btn-text"
          onClick={() => navigate('/attendance')}
        >
          <span>Calculate & Log Attendance</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
