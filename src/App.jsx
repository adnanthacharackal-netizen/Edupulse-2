// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import AssignmentsPage from './pages/AssignmentsPage';
import TimetablePage from './pages/TimetablePage';
import CalendarPage from './pages/CalendarPage';
import RemindersPage from './pages/RemindersPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import AttendancePage from './pages/AttendancePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import GradesPage from './pages/GradesPage';
import AuthPage from './pages/AuthPage';
import './App.css';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Responsive Left Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* In-App PWA Install Prompt on Mobile */}
        <PwaInstallPrompt />

        {/* Dynamic Route View */}
        <main className="app-main-content">
          <Routes>
            {/* 8 Primary Student Productivity Pages */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Preserved Academic Records Pages */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Native Mobile App Bottom Navigation Bar (< 768px) */}
        <BottomNav />
      </div>
    </div>
  );
}
