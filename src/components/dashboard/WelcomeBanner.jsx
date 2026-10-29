// src/components/dashboard/WelcomeBanner.jsx
import React from 'react';
import {
  Clock,
  PlusCircle,
  BellRing,
  CalendarDays,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function WelcomeBanner() {
  const {
    student,
    attendanceStats,
    pendingAssignmentsCount,
    overdueAssignmentsCount,
    pendingTasksCount,
  } = useApp();
  const navigate = useNavigate();

  const [greeting] = React.useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  return (
    <section className="welcome-banner">
      <div className="welcome-content">
        <div className="welcome-badge">
          <span className="live-dot" />
          <span>Fall Semester 2026 • {student.major || 'Undergraduate'}</span>
        </div>
        <h1 className="welcome-title">
          {greeting}, {student.preferredName || student.name}! 👋
        </h1>
        <p className="welcome-subtitle">
          You have <strong className="highlight-text">{pendingAssignmentsCount} pending assignments</strong>{' '}
          {overdueAssignmentsCount > 0 && (
            <span className="text-rose-200 font-bold">
              ({overdueAssignmentsCount} overdue!)
            </span>
          )}{' '}
          and <strong className="highlight-text">{pendingTasksCount} study tasks</strong> scheduled for today.
        </p>

        {/* Quick Action Buttons */}
        <div className="welcome-actions">
          <button
            className="action-btn btn-white"
            onClick={() => navigate('/assignments')}
            title="Create or manage assignments"
          >
            <PlusCircle size={16} className="text-blue-600" />
            <span>Add Assignment</span>
          </button>

          <button
            className="action-btn btn-secondary-glass"
            onClick={() => navigate('/reminders')}
            title="Set custom academic reminders & alarms"
          >
            <BellRing size={16} />
            <span>Create Reminder</span>
          </button>

          <button
            className="action-btn btn-secondary-glass"
            onClick={() => navigate('/timetable')}
            title="Check today's class schedule"
          >
            <Clock size={16} />
            <span>View Timetable</span>
          </button>

          <button
            className="action-btn btn-secondary-glass"
            onClick={() => navigate('/tasks')}
            title="Organize study tasks"
          >
            <CheckSquare size={16} />
            <span>Study Tasks</span>
          </button>
        </div>
      </div>

      <div className="welcome-stats-highlight">
        <div className="glass-metric">
          <span className="glass-metric-label">Cumulative GPA</span>
          <span className="glass-metric-val">{student.gpa}</span>
          <span className="glass-metric-sub">Out of {student.gpaScale}</span>
        </div>
        <div className="glass-metric">
          <span className="glass-metric-label">Attendance</span>
          <span className="glass-metric-val">{attendanceStats.percentage}%</span>
          <span className="glass-metric-sub">
            {attendanceStats.isSafe ? 'Above 75% Safe' : 'Below 75% At Risk'}
          </span>
        </div>
      </div>
    </section>
  );
}
