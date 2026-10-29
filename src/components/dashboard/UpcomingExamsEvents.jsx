// src/components/dashboard/UpcomingExamsEvents.jsx
import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function UpcomingExamsEvents() {
  const { calendarEvents } = useApp();
  const navigate = useNavigate();

  // Filter for exams & key milestones
  const examsAndEvents = calendarEvents
    .filter((e) => e.type === 'exam' || e.type === 'assignment')
    .slice(0, 3);

  return (
    <div className="dashboard-card upcoming-exams-widget">
      <div className="card-header-row">
        <div>
          <div className="flex-title-row">
            <Award size={18} className="text-rose-500" />
            <h3 className="card-title">Exams & Academic Events</h3>
          </div>
          <p className="card-subtitle">Major exam dates and midterm assessments</p>
        </div>
        <button
          className="btn-action-ghost text-xs"
          onClick={() => navigate('/calendar')}
        >
          <span>Calendar</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="exams-mini-list mt-3">
        {examsAndEvents.length === 0 ? (
          <p className="text-xs text-slate-400 p-3 text-center">
            No exams scheduled in this period.
          </p>
        ) : (
          examsAndEvents.map((evt) => (
            <div
              key={evt.id}
              className={`exam-mini-item border-l-4 ${
                evt.type === 'exam' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              }`}
              onClick={() => navigate('/calendar')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {evt.title}
                </span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  evt.type === 'exam' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                }`}>
                  {evt.type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {evt.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {evt.startTime}
                </span>
                {evt.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={11} />
                    {evt.location}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
