// src/pages/CalendarPage.jsx
import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Tag,
  BookOpen,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

const EVENT_TYPES = [
  { key: 'all', label: 'All Events', color: 'slate' },
  { key: 'exam', label: 'Exams', color: 'rose' },
  { key: 'assignment', label: 'Assignments', color: 'amber' },
  { key: 'class', label: 'Classes', color: 'blue' },
  { key: 'study', label: 'Study Sessions', color: 'emerald' },
  { key: 'reminder', label: 'Reminders', color: 'purple' },
];

export default function CalendarPage() {
  const {
    calendarEvents,
    assignments,
    timetable,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 28)); // Fall 2026
  const [selectedType, setSelectedType] = useState('all');
  const [activeView, setActiveView] = useState('month'); // 'month' | 'agenda'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // New Event Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'study',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    location: 'Campus Library Pod 2',
    courseCode: 'CS 301',
    description: '',
  });

  // Synthesize events from calendarEvents + assignment deadlines
  const allEvents = useMemo(() => {
    const list = [...calendarEvents];

    // Inject active assignments as calendar events
    assignments.forEach((asg) => {
      if (asg.dueDate) {
        list.push({
          id: `asg-evt-${asg.id}`,
          title: `Due: ${asg.title}`,
          type: 'assignment',
          date: asg.dueDate,
          startTime: asg.dueTime || '11:59 PM',
          endTime: asg.dueTime || '11:59 PM',
          location: asg.submissionType || 'Online Portal',
          courseCode: asg.courseCode,
          description: asg.notes || `Assignment for ${asg.courseName}. Priority: ${asg.priority}`,
          isAssignmentDerived: true,
          assignmentId: asg.id,
        });
      }
    });

    return list;
  }, [calendarEvents, assignments]);

  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return allEvents;
    return allEvents.filter((e) => e.type === selectedType);
  }, [allEvents, selectedType]);

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = useMemo(() => {
    const prevDays = [];
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevDays.push(prevMonthTotalDays - i);
    }
    return prevDays;
  }, [year, month, firstDayOfMonth]);

  const currentMonthDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [daysInMonth]);

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addCalendarEvent({
      ...formData,
      title: formData.title.trim(),
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      type: 'study',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      location: 'Campus Library Pod 2',
      courseCode: 'CS 301',
      description: '',
    });

    setToastMsg('Academic event scheduled!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteEvent = (event) => {
    if (event.isAssignmentDerived) {
      alert('This event is linked to an assignment deadline. Manage it from the Assignments page.');
      return;
    }
    if (window.confirm(`Delete calendar event "${event.title}"?`)) {
      deleteCalendarEvent(event.id);
      setSelectedEvent(null);
      setToastMsg('Event deleted.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="calendar-page-container">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Academic Calendar</h1>
          <p className="page-main-desc">
            Track exam schedules, assignment due dates, lecture timetables, and personal study sessions.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Schedule Event</span>
        </button>
      </div>

      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="calendar-toolbar dashboard-card">
        <div className="cal-nav-group">
          <button className="cal-btn-icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h2 className="cal-month-title">{monthName}</h2>
          <button className="cal-btn-icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
          <button className="cal-btn-today" onClick={handleToday}>
            Today
          </button>
        </div>

        {/* View Switcher */}
        <div className="cal-view-toggle">
          <button
            className={`view-toggle-btn ${activeView === 'month' ? 'active' : ''}`}
            onClick={() => setActiveView('month')}
          >
            Month Grid
          </button>
          <button
            className={`view-toggle-btn ${activeView === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveView('agenda')}
          >
            Agenda List
          </button>
        </div>
      </div>

      {/* Event Category Filter Pills */}
      <div className="calendar-filter-bar">
        {EVENT_TYPES.map((type) => (
          <button
            key={type.key}
            className={`filter-pill filter-pill-${type.color} ${
              selectedType === type.key ? 'active' : ''
            }`}
            onClick={() => setSelectedType(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Calendar Month Grid View */}
      {activeView === 'month' ? (
        <div className="calendar-grid-wrapper dashboard-card">
          <div className="cal-weekdays-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="cal-weekday-cell">
                {d}
              </div>
            ))}
          </div>

          <div className="cal-days-grid">
            {/* Previous Month Days */}
            {prevMonthDays.map((d, idx) => (
              <div key={`prev-${idx}`} className="cal-day-cell cal-day-disabled">
                <span className="cal-day-num">{d}</span>
              </div>
            ))}

            {/* Current Month Days */}
            {currentMonthDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`cal-day-cell ${isToday ? 'cal-day-today' : ''}`}
                  onClick={() => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    setFormData((prev) => ({ ...prev, date: dateStr }));
                  }}
                >
                  <div className="cal-day-header">
                    <span className={`cal-day-num ${isToday ? 'cal-num-today' : ''}`}>{day}</span>
                    {dayEvents.length > 0 && (
                      <span className="cal-event-dot-count">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="cal-events-stack">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`cal-event-chip event-chip-${event.type}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        title={`${event.title} (${event.startTime})`}
                      >
                        <span className="cal-chip-title">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="cal-more-events">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="calendar-agenda-view dashboard-card">
          <h3 className="agenda-title">Upcoming Academic Events & Deadlines</h3>
          {filteredEvents.length === 0 ? (
            <div className="empty-state-box text-center p-8">
              <CalendarIcon size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500">No events found matching this filter.</p>
            </div>
          ) : (
            <div className="agenda-list">
              {filteredEvents
                .slice()
                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                .map((event) => (
                  <div
                    key={event.id}
                    className={`agenda-card agenda-card-${event.type}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="agenda-date-box">
                      <span className="agenda-day">
                        {event.date ? event.date.split('-')[2] : '--'}
                      </span>
                      <span className="agenda-month">
                        {event.date
                          ? new Date(event.date).toLocaleString('default', { month: 'short' })
                          : ''}
                      </span>
                    </div>

                    <div className="agenda-body">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`agenda-badge badge-${event.type}`}>
                          {event.type.toUpperCase()}
                        </span>
                        {event.courseCode && (
                          <span className="task-chip chip-course">{event.courseCode}</span>
                        )}
                      </div>
                      <h4 className="agenda-event-title">{event.title}</h4>
                      <div className="agenda-meta-row">
                        <span className="agenda-meta-item">
                          <Clock size={13} />
                          {event.startTime} {event.endTime && event.endTime !== event.startTime ? `- ${event.endTime}` : ''}
                        </span>
                        {event.location && (
                          <span className="agenda-meta-item">
                            <MapPin size={13} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <div className="event-details-modal">
            <div className="flex items-center gap-2 mb-4">
              <span className={`agenda-badge badge-${selectedEvent.type}`}>
                {selectedEvent.type.toUpperCase()}
              </span>
              {selectedEvent.courseCode && (
                <span className="task-chip chip-course">{selectedEvent.courseCode}</span>
              )}
            </div>

            <div className="event-info-grid mb-4">
              <div className="event-info-item">
                <CalendarIcon size={16} className="text-blue-500" />
                <div>
                  <span className="info-label">Date</span>
                  <p className="info-val">{selectedEvent.date}</p>
                </div>
              </div>
              <div className="event-info-item">
                <Clock size={16} className="text-amber-500" />
                <div>
                  <span className="info-label">Time</span>
                  <p className="info-val">
                    {selectedEvent.startTime}{' '}
                    {selectedEvent.endTime && selectedEvent.endTime !== selectedEvent.startTime
                      ? `- ${selectedEvent.endTime}`
                      : ''}
                  </p>
                </div>
              </div>
              {selectedEvent.location && (
                <div className="event-info-item col-span-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <div>
                    <span className="info-label">Location / Platform</span>
                    <p className="info-val">{selectedEvent.location}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div className="event-desc-box mb-6">
                <span className="info-label">Description & Notes:</span>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              {!selectedEvent.isAssignmentDerived && (
                <button
                  type="button"
                  className="btn-danger flex items-center gap-1.5"
                  onClick={() => handleDeleteEvent(selectedEvent)}
                >
                  <Trash2 size={15} />
                  <span>Delete Event</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Event Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Schedule Academic Event"
        >
          <form onSubmit={handleCreateSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Midterm Review Session, Lab Demo, Group Project..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="study">Personal Study Session</option>
                  <option value="exam">Exam / Quiz Date</option>
                  <option value="assignment">Project Deadline</option>
                  <option value="class">Class / Seminar</option>
                  <option value="reminder">Academic Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Course</label>
                <select
                  className="form-select"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                >
                  <option value="CS 301">CS 301 - Database Systems</option>
                  <option value="CS 310">CS 310 - Algorithms</option>
                  <option value="MATH 240">MATH 240 - Linear Algebra</option>
                  <option value="CS 335">CS 335 - Web Applications</option>
                  <option value="HUM 120">HUM 120 - Tech Ethics</option>
                  <option value="General">General / Extracurricular</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10:00 AM"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="11:30 AM"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Room / Platform</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Science Hall 304, Library Pod 3, Zoom Link..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Preparation Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="What topics to cover or materials to bring..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add to Calendar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
