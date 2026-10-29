// src/components/dashboard/UpcomingAssignments.jsx
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  UploadCloud,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDeadlineCountdown } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function UpcomingAssignments() {
  const { assignments, updateAssignmentStatus } = useApp();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [feedbackToast, setFeedbackToast] = useState(null);
  const navigate = useNavigate();

  const handleTurnIn = (id, title) => {
    updateAssignmentStatus(id, 'Submitted');
    setFeedbackToast(`Submitted "${title}" successfully!`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const filtered = assignments.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return item.status === 'In Progress' || item.status === 'Not Started';
    if (activeFilter === 'urgent') return item.priority === 'Urgent' || item.priority === 'High';
    return true;
  });

  return (
    <div className="dashboard-card assignments-section">
      <div className="card-header-row">
        <div>
          <div className="flex-title-row">
            <h3 className="card-title">Upcoming Assignment Deadlines</h3>
            <span className="count-badge">{assignments.length} Total</span>
          </div>
          <p className="card-subtitle">Keep track of coursework deadlines and alarms</p>
        </div>

        {/* Filter buttons */}
        <div className="filter-button-group">
          <button
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${activeFilter === 'urgent' ? 'active' : ''}`}
            onClick={() => setActiveFilter('urgent')}
          >
            Urgent / High
          </button>
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {feedbackToast && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Assignment Cards Grid */}
      <div className="assignment-cards-container">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 text-center">
            No assignments matching this filter.
          </p>
        ) : (
          filtered.slice(0, 4).map((item) => {
            const isSubmitted = item.status === 'Submitted' || item.status === 'Completed';
            const countdown = getDeadlineCountdown(item.dueDate, item.dueTime);
            const isOverdue = countdown.isOverdue && !isSubmitted;

            return (
              <div
                key={item.id}
                className={`assignment-card priority-border-${item.priority.toLowerCase()} ${
                  isSubmitted ? 'assignment-card-submitted' : ''
                } ${isOverdue ? 'asg-card-overdue' : ''}`}
              >
                <div className="assignment-top">
                  <div className="assignment-course-tag">
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

                <h4 className="asg-title-text">{item.title}</h4>

                <div className="asg-meta-row">
                  <div className="asg-meta-item">
                    <Calendar size={13} />
                    <span>Due {item.dueDate}</span>
                  </div>
                  <div className="asg-meta-item">
                    <Clock
                      size={13}
                      className={isOverdue ? 'text-rose-600' : 'text-amber-600'}
                    />
                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'asg-days-left'}>
                      {countdown.text}
                    </span>
                  </div>
                  {item.reminderEnabled && (
                    <div className="asg-meta-item text-blue-500">
                      <BellRing size={12} />
                      <span>Alarm On</span>
                    </div>
                  )}
                </div>

                <div className="asg-footer-row">
                  <span className="asg-points-badge">{item.points} pts</span>

                  <div className="asg-card-actions">
                    {!isSubmitted && (
                      <button
                        className="btn-turn-in"
                        onClick={() => handleTurnIn(item.id, item.title)}
                        title="Submit coursework"
                      >
                        <UploadCloud size={13} />
                        <span>Turn In</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card-footer-action">
        <button
          className="see-all-btn"
          onClick={() => navigate('/assignments')}
        >
          <span>Manage All Assignments</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
