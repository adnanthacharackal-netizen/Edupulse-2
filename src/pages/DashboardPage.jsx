// src/pages/DashboardPage.jsx
import React from 'react';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCards from '../components/dashboard/StatCards';
import UpcomingAssignments from '../components/dashboard/UpcomingAssignments';
import TodayStudyTasks from '../components/dashboard/TodayStudyTasks';
import UpcomingExamsEvents from '../components/dashboard/UpcomingExamsEvents';
import TimetableSchedule from '../components/dashboard/TimetableSchedule';
import StudentProfileCard from '../components/dashboard/StudentProfileCard';
import AttendanceBreakdown from '../components/dashboard/AttendanceBreakdown';
import RecentAnnouncements from '../components/dashboard/RecentAnnouncements';

export default function DashboardPage() {
  return (
    <div className="dashboard-page-container">
      {/* 1. Welcome Greeting Banner with Quick Actions */}
      <WelcomeBanner />

      {/* 2. Overview Stat Cards: Total, Pending, Completed, Overdue */}
      <StatCards />

      {/* 3. Core 2-Column Responsive Layout */}
      <div className="dashboard-main-grid">
        {/* Left Primary Column: Study Tasks, Deadlines & Timetable */}
        <div className="dashboard-primary-col">
          {/* Today's Study Tasks & Progress Bar */}
          <TodayStudyTasks />

          {/* Upcoming Assignment Deadlines with Live Countdowns */}
          <UpcomingAssignments />

          {/* Today's Class Schedule */}
          <TimetableSchedule />
        </div>

        {/* Right Secondary Column: Exams, Profile & Attendance */}
        <div className="dashboard-secondary-col">
          {/* Upcoming Exams and Academic Milestones */}
          <UpcomingExamsEvents />

          {/* Student Profile Card */}
          <StudentProfileCard />

          {/* Attendance Health Breakdown */}
          <AttendanceBreakdown />

          {/* Campus Notices & Bulletins */}
          <RecentAnnouncements />
        </div>
      </div>
    </div>
  );
}
