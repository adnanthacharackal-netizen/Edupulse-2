// src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  Calendar,
  BellRing,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const mobileTabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare, badgeKey: 'tasks' },
  { path: '/assignments', label: 'Assignments', icon: FileCheck2, badgeKey: 'assignments' },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/reminders', label: 'Alarms', icon: BellRing },
];

export default function BottomNav() {
  const { pendingAssignmentsCount, overdueAssignmentsCount, pendingTasksCount } = useApp();
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Student Navigation Bar">
      <div className="bottom-nav-inner">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="bottom-nav-icon-box">
                <Icon size={20} className="bottom-nav-icon" />

                {tab.badgeKey === 'assignments' && pendingAssignmentsCount > 0 && (
                  <span
                    className={`bottom-nav-badge ${
                      overdueAssignmentsCount > 0 ? 'badge-danger' : 'badge-warning'
                    }`}
                  >
                    {pendingAssignmentsCount}
                  </span>
                )}

                {tab.badgeKey === 'tasks' && pendingTasksCount > 0 && (
                  <span className="bottom-nav-badge badge-primary">
                    {pendingTasksCount}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
              {isActive && <span className="bottom-nav-active-dot" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
