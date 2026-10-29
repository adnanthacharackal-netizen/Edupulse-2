// src/components/dashboard/TimetableSchedule.jsx
import React, { useState } from 'react';
import { Clock, MapPin, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TimetableSchedule() {
  const { timetable } = useApp();
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  // Show Tuesday schedule as today's demo default
  const classesToday = timetable.Tuesday || [];

  const filteredSchedule = classesToday.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'upcoming') return item.status === 'upcoming';
    if (filterType === 'ongoing') return item.status === 'ongoing';
    return true;
  });

  return (
    <div className="dashboard-card timetable-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Today's Class Timetable</h3>
          <p className="card-subtitle">Tuesday • {classesToday.length} Scheduled Sessions</p>
        </div>

        <div className="filter-button-group">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({classesToday.length})
          </button>
          <button
            className={`filter-btn ${filterType === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterType('upcoming')}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="timetable-timeline">
        {filteredSchedule.map((item) => {
          const isOngoing = item.status === 'ongoing';
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              className={`timeline-item ${isOngoing ? 'timeline-item-ongoing' : ''} ${
                isCompleted ? 'timeline-item-completed' : ''
              }`}
            >
              <div className="timeline-marker">
                <div className={`marker-dot dot-${item.status || 'upcoming'}`}>
                  {isOngoing && <span className="pulse-ring" />}
                  {isCompleted && <CheckCircle2 size={12} color="#ffffff" />}
                </div>
                <div className="marker-line" />
              </div>

              <div className="timeline-content">
                <div className="class-top-row">
                  <div className="class-title-group">
                    <span className="course-code-badge">{item.courseCode}</span>
                    <h4 className="class-name">{item.courseName}</h4>
                  </div>
                  <span className={`status-pill pill-${item.status || 'upcoming'}`}>
                    {item.status ? item.status.toUpperCase() : 'SCHEDULED'}
                  </span>
                </div>

                <div className="class-meta-grid">
                  <div className="class-meta-item">
                    <Clock size={14} className="meta-icon" />
                    <span>{item.time}</span>
                  </div>
                  <div className="class-meta-item">
                    <MapPin size={14} className="meta-icon" />
                    <span>{item.room}</span>
                  </div>
                  <div className="class-meta-item">
                    <User size={14} className="meta-icon" />
                    <span>{item.instructor}</span>
                  </div>
                  <div className="class-meta-item">
                    <span className="type-badge">{item.type}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-footer-action">
        <button
          className="link-btn-text"
          onClick={() => navigate('/timetable')}
        >
          <span>View Full Weekly Timetable (Mon - Fri)</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
