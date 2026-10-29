// src/components/dashboard/StatCards.jsx
import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function StatCards() {
  const {
    assignments,
    pendingAssignmentsCount,
    completedAssignmentsCount,
    overdueAssignmentsCount,
  } = useApp();
  const navigate = useNavigate();

  const totalAssignments = assignments.length;
  const overdueCount = overdueAssignmentsCount || 0;

  const dynamicStats = [
    {
      id: 'total',
      route: '/assignments',
      title: 'Total Assignments',
      value: `${totalAssignments}`,
      subtext: 'Current semester coursework items',
      badgeText: 'All Subjects',
      badgeType: 'neutral',
      icon: BookOpen,
      color: 'blue',
      progress: 100,
    },
    {
      id: 'pending',
      route: '/assignments',
      title: 'Pending & Active',
      value: `${pendingAssignmentsCount}`,
      subtext: 'In progress or not yet submitted',
      badgeText: pendingAssignmentsCount > 0 ? 'Action Needed' : 'Caught Up',
      badgeType: pendingAssignmentsCount > 0 ? 'warning' : 'positive',
      icon: Clock,
      color: 'sky',
      progress: totalAssignments > 0 ? Math.round((pendingAssignmentsCount / totalAssignments) * 100) : 0,
    },
    {
      id: 'completed',
      route: '/assignments',
      title: 'Completed & Graded',
      value: `${completedAssignmentsCount}`,
      subtext: 'Turned in and verified',
      badgeText: 'On Track',
      badgeType: 'positive',
      icon: CheckCircle2,
      color: 'emerald',
      progress: totalAssignments > 0 ? Math.round((completedAssignmentsCount / totalAssignments) * 100) : 0,
    },
    {
      id: 'overdue',
      route: '/assignments',
      title: 'Overdue Deadlines',
      value: `${overdueCount}`,
      subtext: overdueCount > 0 ? 'Requires immediate submission!' : 'Zero overdue items',
      badgeText: overdueCount > 0 ? 'Urgent Warning' : 'Clear',
      badgeType: overdueCount > 0 ? 'warning' : 'positive',
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'rose' : 'indigo',
      progress: totalAssignments > 0 ? Math.round((overdueCount / totalAssignments) * 100) : 0,
    },
  ];

  return (
    <div className="stat-cards-grid">
      {dynamicStats.map((stat) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={stat.id}
            className={`stat-card stat-card-${stat.color}`}
            onClick={() => navigate(stat.route)}
            role="button"
            tabIndex={0}
            title={`View ${stat.title}`}
          >
            <div className="stat-card-top">
              <div className={`stat-icon-wrapper icon-${stat.color}`}>
                <IconComponent size={22} />
              </div>
              <span className={`stat-badge badge-${stat.badgeType}`}>
                {stat.badgeText}
              </span>
            </div>

            <div className="stat-card-body">
              <p className="stat-label">{stat.title}</p>
              <h2 className="stat-value">{stat.value}</h2>
              <p className="stat-subtext">{stat.subtext}</p>
            </div>

            <div className="stat-card-footer">
              <div className="stat-progress-track">
                <div
                  className={`stat-progress-fill fill-${stat.color}`}
                  style={{ width: `${Math.max(5, stat.progress)}%` }}
                />
              </div>
              <div className="stat-link">
                <span>View Assignments</span>
                <ArrowRight size={14} className="stat-arrow" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
