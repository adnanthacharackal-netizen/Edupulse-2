// src/pages/TimetablePage.jsx
import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  MapPin,
  User,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  ListFilter,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { Lock, ShieldCheck } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { timetable, addClassSchedule, removeClassSchedule } = useApp();
  const { isStaff } = useAuth();

  // Active day selection & view mode ('day' or 'weekly-grid')
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [viewMode, setViewMode] = useState('day');

  // Feedback toast
  const [toastMsg, setToastMsg] = useState('');

  // Add Class Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Tuesday',
    courseCode: 'CS 301',
    courseName: 'Database Management Systems',
    instructor: 'Prof. Michael Chang',
    room: 'Science Hall 304',
    time: '09:00 AM - 10:15 AM',
    type: 'Lecture',
  });
  const [formErrors, setFormErrors] = useState({});

  const currentClasses = timetable[selectedDay] || [];

  const handleRemoveClass = (day, classId, courseName) => {
    if (window.confirm(`Remove ${courseName} from ${day}'s schedule?`)) {
      removeClassSchedule(day, classId);
      setToastMsg(`Removed class from ${day}.`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.courseCode.trim()) errors.courseCode = 'Course code is required.';
    if (!formData.courseName.trim()) errors.courseName = 'Course name is required.';
    if (!formData.instructor.trim()) errors.instructor = 'Instructor name is required.';
    if (!formData.room.trim()) errors.room = 'Classroom / Room location is required.';
    if (!formData.time.trim()) errors.time = 'Time interval is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addClassSchedule(formData.day, {
      courseCode: formData.courseCode.trim(),
      courseName: formData.courseName.trim(),
      instructor: formData.instructor.trim(),
      room: formData.room.trim(),
      time: formData.time.trim(),
      type: formData.type,
      status: 'upcoming',
    });

    setToastMsg(`Scheduled "${formData.courseName}" for ${formData.day}!`);
    setIsAddModalOpen(false);
    setFormErrors({});
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="timetable-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Weekly Class Timetable</h1>
          <p className="page-main-desc">
            Organize lectures, lab practicals, seminar locations, and faculty schedules.
          </p>
        </div>
        <div className="header-actions-group">
          {/* View mode toggle: Day view vs Weekly Grid */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
              title="Day-by-Day Card View"
            >
              <ListFilter size={16} /> Day View
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'weekly-grid' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly-grid')}
              title="Full Weekly Overview Grid"
            >
              <LayoutGrid size={16} /> Full Week Grid
            </button>
          </div>

          {isStaff ? (
            <button
              className="btn-primary-action"
              onClick={() => {
                setFormData((prev) => ({ ...prev, day: selectedDay }));
                setIsAddModalOpen(true);
              }}
            >
              <PlusCircle size={17} />
              <span>Schedule Class</span>
            </button>
          ) : (
            <div
              className="btn-restricted-pill"
              title="Class timetable management is restricted to Academic Staff"
            >
              <Lock size={15} />
              <span>Staff Timetable Administration</span>
            </div>
          )}
        </div>
      </div>

      {/* Role-Based Access Indicator */}
      <div className={`role-permission-banner ${isStaff ? 'banner-staff' : 'banner-student'}`}>
        {isStaff ? (
          <>
            <ShieldCheck size={16} className="text-blue-600" />
            <span>
              <strong>Authorized Staff Mode:</strong> You can add, edit, or remove lecture and practical timetable entries.
            </span>
          </>
        ) : (
          <>
            <Lock size={16} className="text-amber-600" />
            <span>
              <strong>Student Mode (Published Schedule):</strong> Timetable schedules are managed by university faculty. You have full read access to both daily and weekly views.
            </span>
          </>
        )}
      </div>

      {/* Success Notification */}
      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DAY-BY-DAY VIEW */}
      {viewMode === 'day' && (
        <>
          {/* Day Navigation Tabs */}
          <div className="day-tabs-container">
            {daysOfWeek.map((day) => {
              const count = (timetable[day] || []).length;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  className={`day-tab-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-tab-name">{day}</span>
                  <span className="day-tab-count">
                    {count === 0 ? 'No classes' : `${count} ${count === 1 ? 'class' : 'classes'}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Day Schedule List */}
          <div className="dashboard-card" style={{ marginTop: '1.25rem' }}>
            <div className="card-header-row">
              <div>
                <h3 className="card-title">{selectedDay}'s Classes</h3>
                <p className="card-subtitle">
                  {currentClasses.length} sessions scheduled for {selectedDay}
                </p>
              </div>
            </div>

            {currentClasses.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={`No classes on ${selectedDay}!`}
                description="Take a break, work on your assignments, or catch up on reading."
                actionLabel={`Add a class on ${selectedDay}`}
                onAction={() => {
                  setFormData((prev) => ({ ...prev, day: selectedDay }));
                  setIsAddModalOpen(true);
                }}
              />
            ) : (
              <div className="classes-grid">
                {currentClasses.map((item) => (
                  <div key={item.id} className="class-schedule-card">
                    <div className="class-card-header">
                      <div className="course-code-row">
                        <span className="course-code-badge">{item.courseCode}</span>
                        <span className="class-type-tag">{item.type}</span>
                      </div>
                      {isStaff && (
                        <button
                          className="btn-action-delete"
                          onClick={() => handleRemoveClass(selectedDay, item.id, item.courseName)}
                          title="Remove class"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <h4 className="class-card-title">{item.courseName}</h4>

                    <div className="class-card-meta-list">
                      <div className="class-meta-item">
                        <Clock size={15} className="meta-icon" />
                        <span>{item.time}</span>
                      </div>
                      <div className="class-meta-item">
                        <MapPin size={15} className="meta-icon text-blue-600" />
                        <span>{item.room}</span>
                      </div>
                      <div className="class-meta-item">
                        <User size={15} className="meta-icon text-slate-500" />
                        <span>{item.instructor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FULL WEEKLY OVERVIEW GRID */}
      {viewMode === 'weekly-grid' && (
        <div className="weekly-grid-container">
          {daysOfWeek.map((day) => {
            const dayClasses = timetable[day] || [];

            return (
              <div key={day} className="weekly-grid-col">
                <div className="weekly-col-header">
                  <span className="col-day-title">{day}</span>
                  <span className="col-day-badge">{dayClasses.length}</span>
                </div>

                <div className="weekly-col-body">
                  {dayClasses.length === 0 ? (
                    <div className="weekly-empty-cell">
                      <span>Free Day</span>
                    </div>
                  ) : (
                    dayClasses.map((cls) => (
                      <div key={cls.id} className="weekly-grid-item">
                        <div className="grid-item-time">{cls.time}</div>
                        <div className="grid-item-code">{cls.courseCode}</div>
                        <div className="grid-item-name">{cls.courseName}</div>
                        <div className="grid-item-room">📍 {cls.room}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Class */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Class"
        subtitle="Add a lecture, lab, or tutorial slot to your timetable"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="class-day">
                Day of Week <span className="required-star">*</span>
              </label>
              <select
                id="class-day"
                className="form-select"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="class-type">
                Session Type
              </label>
              <select
                id="class-type"
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab & Practical">Lab & Practical</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="class-code">
                Course Code <span className="required-star">*</span>
              </label>
              <input
                id="class-code"
                type="text"
                placeholder="e.g. CS 301"
                className={`form-input ${formErrors.courseCode ? 'form-input-error' : ''}`}
                value={formData.courseCode}
                onChange={(e) => {
                  setFormData({ ...formData, courseCode: e.target.value });
                  if (formErrors.courseCode) setFormErrors({ ...formErrors, courseCode: null });
                }}
              />
              {formErrors.courseCode && <p className="form-error-msg">{formErrors.courseCode}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="class-name">
                Course Name <span className="required-star">*</span>
              </label>
              <input
                id="class-name"
                type="text"
                placeholder="e.g. Distributed Computing"
                className={`form-input ${formErrors.courseName ? 'form-input-error' : ''}`}
                value={formData.courseName}
                onChange={(e) => {
                  setFormData({ ...formData, courseName: e.target.value });
                  if (formErrors.courseName) setFormErrors({ ...formErrors, courseName: null });
                }}
              />
              {formErrors.courseName && <p className="form-error-msg">{formErrors.courseName}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="class-time">
                Time Interval <span className="required-star">*</span>
              </label>
              <input
                id="class-time"
                type="text"
                placeholder="e.g. 10:30 AM - 12:00 PM"
                className={`form-input ${formErrors.time ? 'form-input-error' : ''}`}
                value={formData.time}
                onChange={(e) => {
                  setFormData({ ...formData, time: e.target.value });
                  if (formErrors.time) setFormErrors({ ...formErrors, time: null });
                }}
              />
              {formErrors.time && <p className="form-error-msg">{formErrors.time}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="class-room">
                Room / Venue <span className="required-star">*</span>
              </label>
              <input
                id="class-room"
                type="text"
                placeholder="e.g. Hall B-204"
                className={`form-input ${formErrors.room ? 'form-input-error' : ''}`}
                value={formData.room}
                onChange={(e) => {
                  setFormData({ ...formData, room: e.target.value });
                  if (formErrors.room) setFormErrors({ ...formErrors, room: null });
                }}
              />
              {formErrors.room && <p className="form-error-msg">{formErrors.room}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="class-instructor">
              Faculty Instructor <span className="required-star">*</span>
            </label>
            <input
              id="class-instructor"
              type="text"
              placeholder="e.g. Dr. Evelyn Reed"
              className={`form-input ${formErrors.instructor ? 'form-input-error' : ''}`}
              value={formData.instructor}
              onChange={(e) => {
                setFormData({ ...formData, instructor: e.target.value });
                if (formErrors.instructor) setFormErrors({ ...formErrors, instructor: null });
              }}
            />
            {formErrors.instructor && <p className="form-error-msg">{formErrors.instructor}</p>}
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-save">
              Add to Timetable
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
