// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  CalendarDays,
  Calendar as CalendarIcon,
  BellRing,
  BookOpen,
  Settings,
  X,
  PieChart,
  Megaphone,
  GraduationCap,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// 8 Core Navigation Items required by the Student Productivity Suite
const primaryNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'My Tasks', icon: CheckSquare, badgeKey: 'tasks' },
  { path: '/assignments', label: 'Assignments', icon: FileCheck2, badgeKey: 'assignments' },
  { path: '/timetable', label: 'Timetable', icon: CalendarDays },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { path: '/reminders', label: 'Alarms & Reminders', icon: BellRing, badgeKey: 'reminders' },
  { path: '/notes', label: 'Notes', icon: BookOpen },
  { path: '/settings', label: 'Profile & Settings', icon: Settings },
];

const secondaryNavItems = [
  { path: '/attendance', label: 'Attendance', icon: PieChart },
  { path: '/announcements', label: 'Announcements', icon: Megaphone, badgeKey: 'announcements' },
  { path: '/grades', label: 'Grades & GPA', icon: GraduationCap },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const {
    pendingAssignmentsCount,
    overdueAssignmentsCount,
    pendingTasksCount,
    unreadCount,
    theme,
    toggleTheme,
  } = useApp();
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand / Logo Section */}
        <div className="sidebar-brand">
          <NavLink to="/" className="brand-logo-container" onClick={handleLinkClick}>
            <div className="brand-icon">
              <BookOpen size={22} color="#ffffff" />
            </div>
            <div className="brand-text">
              <span className="brand-title">EduPulse</span>
              <span className="brand-subtitle">Student Suite</span>
            </div>
          </NavLink>
          {/* Mobile close button */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Navigation List (8 Required Pages) */}
        <nav className="sidebar-nav">
          <p className="nav-section-title">STUDENT TASKBAR</p>
          <ul className="nav-list">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>

                    {item.badgeKey === 'assignments' && pendingAssignmentsCount > 0 && (
                      <span className={`nav-pill ${overdueAssignmentsCount > 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {pendingAssignmentsCount}
                      </span>
                    )}

                    {item.badgeKey === 'tasks' && pendingTasksCount > 0 && (
                      <span className="nav-pill badge-primary">{pendingTasksCount}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Academic Records Section */}
          <p className="nav-section-title mt-4">ACADEMIC RECORDS</p>
          <ul className="nav-list">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>

                    {item.badgeKey === 'announcements' && unreadCount > 0 && (
                      <span className="nav-pill badge-primary">{unreadCount}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with Dark Mode Toggle */}
        <div className="sidebar-footer">
          <button
            className="theme-quick-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="semester-badge-card mt-2">
            <div className="semester-badge-header">
              <Sparkles size={15} className="text-blue-500" />
              <span>Fall Semester 2026</span>
            </div>
            <div className="semester-progress-bar">
              <div className="semester-progress-fill" style={{ width: '65%' }}></div>
            </div>
            <div className="semester-meta">
              <span>Week 9 of 14</span>
              <span>65% Passed</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
