// src/components/layout/Header.jsx
import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  CheckCheck,
  ShieldCheck,
  GraduationCap,
  LogOut,
  RotateCcw,
  Moon,
  Sun,
  AlertTriangle,
  BellRing,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Header({ onOpenMobileMenu }) {
  const {
    unreadNotificationsCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    theme,
    toggleTheme,
    student,
  } = useApp();

  const { profile, isStaff, switchRole, user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [todayFormatted] = useState(() =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date())
  );

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/assignments?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleRole = () => {
    switchRole(isStaff ? 'student' : 'staff');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search assignments, study tasks, timetable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
      </div>

      <div className="header-right">
        {/* Theme Quick Toggle */}
        <button
          className="header-theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun size={19} className="text-amber-400" />
          ) : (
            <Moon size={19} className="text-slate-600" />
          )}
        </button>

        {/* Role Switcher Pill for Testing Permissions */}
        <div className="role-switcher-container">
          <button
            className={`role-badge-btn ${isStaff ? 'role-badge-staff' : 'role-badge-student'}`}
            onClick={toggleRole}
            title="Click to toggle between Student and Authorized Staff permissions"
          >
            {isStaff ? <ShieldCheck size={14} /> : <GraduationCap size={14} />}
            <span>{isStaff ? 'Staff View' : 'Student View'}</span>
            <RotateCcw size={11} className="role-switch-icon" />
          </button>
        </div>

        <div className="date-chip">
          <Sparkles size={14} className="text-blue-600" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications Popover */}
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications & alarms"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="notification-dot">{unreadNotificationsCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-popover">
              <div className="popover-header">
                <div>
                  <span className="popover-title">Notification & Alarm Center</span>
                  <span className="popover-badge ml-2">{unreadNotificationsCount} Unread</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={markAllNotificationsRead}
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              <ul className="notification-list">
                {notifications.length === 0 ? (
                  <li className="p-4 text-center text-xs text-slate-400">
                    No active alarms or notifications
                  </li>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <li
                      key={notif.id}
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) navigate(notif.link);
                        setShowNotifications(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notif-bullet">
                        {notif.type === 'overdue' ? (
                          <AlertTriangle size={14} className="text-rose-500" />
                        ) : (
                          <BellRing size={14} className="text-blue-500" />
                        )}
                      </div>
                      <div className="notif-content">
                        <p className="notif-text font-semibold text-xs">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{notif.message}</p>
                        <span className="notif-time">{notif.timestamp}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <div className="popover-footer">
                <button
                  className="mark-read-btn"
                  onClick={() => {
                    navigate('/reminders');
                    setShowNotifications(false);
                  }}
                >
                  <CheckCheck size={14} /> Open Alarms & Reminders Hub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Profile Pill */}
        <div className="header-profile-group">
          <div
            className="header-profile-pill"
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer' }}
            title="Account Settings"
          >
            <img
              src={
                profile?.avatar_url ||
                student?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt={profile?.full_name || student?.name}
              className="header-avatar"
            />
            <div className="header-profile-info">
              <span className="header-student-name">
                {profile?.full_name || student?.name}
              </span>
              <span className="header-student-role">
                {isStaff ? 'Staff' : student?.major ? student.major.split(' ')[0] : 'Student'}
              </span>
            </div>
          </div>

          {user && (
            <button
              className="btn-header-auth"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
