// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialStudentProfile,
  initialSubjectAttendance,
  initialAssignments,
  initialTasks,
  initialNotes,
  initialCalendarEvents,
  initialCustomReminders,
  initialNotifications,
  initialNotificationPreferences,
  weeklyTimetableData,
  initialAnnouncements,
} from '../data/mockData';
import {
  playNotificationChime,
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  scheduleCapacitorNotification,
  parseDueTimestamp,
  getDeadlineCountdown,
  REMINDER_INTERVAL_OFFSETS,
  REMINDER_INTERVAL_LABELS,
} from '../services/notificationService';

export const AppContext = createContext(null);

const STORAGE_KEYS = {
  STUDENT: 'edupulse_student_profile',
  ASSIGNMENTS: 'edupulse_assignments_v2',
  TASKS: 'edupulse_tasks_v2',
  NOTES: 'edupulse_notes_v2',
  CALENDAR: 'edupulse_calendar_v2',
  REMINDERS: 'edupulse_reminders_v2',
  NOTIFICATIONS: 'edupulse_notifications_v2',
  NOTIF_PREFS: 'edupulse_notif_prefs_v2',
  TIMETABLE: 'edupulse_timetable_v2',
  ANNOUNCEMENTS: 'edupulse_announcements_v2',
  THEME: 'edupulse_theme_v2',
  FIRED_ALARMS: 'edupulse_fired_alarms_v2',
  ATTENDANCE: 'edupulse_attendance_v2',
};

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[AppContext] Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[AppContext] Error writing ${key} to localStorage:`, err);
  }
}

export function AppProvider({ children }) {
  // --- Persistent State ---
  const [student, setStudentState] = useState(() =>
    loadStorage(STORAGE_KEYS.STUDENT, initialStudentProfile)
  );

  const [subjects, setSubjectsState] = useState(() =>
    loadStorage(STORAGE_KEYS.ATTENDANCE, initialSubjectAttendance)
  );

  const [assignments, setAssignmentsState] = useState(() =>
    loadStorage(STORAGE_KEYS.ASSIGNMENTS, initialAssignments)
  );

  const [tasks, setTasksState] = useState(() =>
    loadStorage(STORAGE_KEYS.TASKS, initialTasks)
  );

  const [notes, setNotesState] = useState(() =>
    loadStorage(STORAGE_KEYS.NOTES, initialNotes)
  );

  const [calendarEvents, setCalendarEventsState] = useState(() =>
    loadStorage(STORAGE_KEYS.CALENDAR, initialCalendarEvents)
  );

  const [reminders, setRemindersState] = useState(() =>
    loadStorage(STORAGE_KEYS.REMINDERS, initialCustomReminders)
  );

  const [notifications, setNotificationsState] = useState(() =>
    loadStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications)
  );

  const [notificationPreferences, setNotificationPreferencesState] = useState(() =>
    loadStorage(STORAGE_KEYS.NOTIF_PREFS, initialNotificationPreferences)
  );

  const [timetable, setTimetableState] = useState(() =>
    loadStorage(STORAGE_KEYS.TIMETABLE, weeklyTimetableData)
  );

  const [announcements, setAnnouncementsState] = useState(() =>
    loadStorage(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements)
  );

  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [firedAlarms, setFiredAlarms] = useState(() =>
    new Set(loadStorage(STORAGE_KEYS.FIRED_ALARMS, []))
  );

  // Sync Theme to HTML Root Element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync Fired Alarms to LocalStorage
  useEffect(() => {
    saveStorage(STORAGE_KEYS.FIRED_ALARMS, Array.from(firedAlarms));
  }, [firedAlarms]);

  // Wrapped State Setters with Automatic LocalStorage Sync
  const setStudent = useCallback((val) => {
    setStudentState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.STUDENT, next);
      return next;
    });
  }, []);

  const setSubjects = useCallback((val) => {
    setSubjectsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.ATTENDANCE, next);
      return next;
    });
  }, []);

  const setAssignments = useCallback((val) => {
    setAssignmentsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.ASSIGNMENTS, next);
      return next;
    });
  }, []);

  const setTasks = useCallback((val) => {
    setTasksState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.TASKS, next);
      return next;
    });
  }, []);

  const setNotes = useCallback((val) => {
    setNotesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.NOTES, next);
      return next;
    });
  }, []);

  const setCalendarEvents = useCallback((val) => {
    setCalendarEventsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
  }, []);

  const setReminders = useCallback((val) => {
    setRemindersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.REMINDERS, next);
      return next;
    });
  }, []);

  const setNotifications = useCallback((val) => {
    setNotificationsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, next);
      return next;
    });
  }, []);

  const setNotificationPreferences = useCallback((val) => {
    setNotificationPreferencesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.NOTIF_PREFS, next);
      return next;
    });
  }, []);

  const setTimetable = useCallback((val) => {
    setTimetableState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.TIMETABLE, next);
      return next;
    });
  }, []);

  const setAnnouncements = useCallback((val) => {
    setAnnouncementsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStorage(STORAGE_KEYS.ANNOUNCEMENTS, next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // --- Attendance Calculations ---
  const attendanceStats = useMemo(() => {
    const totalAttended = subjects.reduce((acc, sub) => acc + sub.attended, 0);
    const totalHeld = subjects.reduce((acc, sub) => acc + sub.total, 0);
    const percentage = totalHeld > 0 ? ((totalAttended / totalHeld) * 100).toFixed(1) : 0;
    const isSafe = Number(percentage) >= 75;

    return {
      totalAttended,
      totalHeld,
      totalMissed: totalHeld - totalAttended,
      percentage: Number(percentage),
      isSafe,
    };
  }, [subjects]);

  const logAttendance = (courseCode, isPresent) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.code === courseCode) {
          return {
            ...sub,
            attended: isPresent ? sub.attended + 1 : sub.attended,
            total: sub.total + 1,
          };
        }
        return sub;
      })
    );
  };

  // --- Assignments CRUD & Alarm Scheduling ---
  const addAssignment = useCallback((newAsg) => {
    const id = newAsg.id || `asg-${Date.now()}`;
    const formatted = {
      id,
      title: newAsg.title || 'Untitled Assignment',
      courseCode: newAsg.courseCode || 'GEN 101',
      courseName: newAsg.courseName || newAsg.courseCode || 'General Subject',
      teacherName: newAsg.teacherName || 'Faculty Instructor',
      assignedDate: newAsg.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: newAsg.dueDate || new Date().toISOString().split('T')[0],
      dueTime: newAsg.dueTime || '23:59',
      priority: newAsg.priority || 'Medium',
      status: newAsg.status || 'Not Started',
      points: Number(newAsg.points) || 100,
      submissionType: newAsg.submissionType || 'Online Submission',
      notes: newAsg.notes || '',
      attachmentLink: newAsg.attachmentLink || '',
      reminders: Array.isArray(newAsg.reminders) && newAsg.reminders.length > 0
        ? newAsg.reminders
        : notificationPreferences.defaultIntervals || ['1d', '2h', 'due'],
      reminderEnabled: newAsg.reminderEnabled !== undefined ? newAsg.reminderEnabled : true,
      recurringStudy: Boolean(newAsg.recurringStudy),
    };

    setAssignments((prev) => [formatted, ...prev]);

    // Schedule native notification via Capacitor if available
    if (formatted.reminderEnabled) {
      const due = parseDueTimestamp(formatted.dueDate, formatted.dueTime);
      if (due && due.getTime() > Date.now()) {
        scheduleCapacitorNotification({
          id: formatted.id,
          title: `Assignment Due: ${formatted.title}`,
          body: `${formatted.courseCode} due at ${formatted.dueTime}`,
          scheduleAt: due,
        });
      }
    }

    return formatted;
  }, [notificationPreferences.defaultIntervals, setAssignments]);

  const updateAssignment = useCallback((id, updatedFields) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === id) {
          const merged = { ...asg, ...updatedFields };

          // If due date or time changed, clear old fired alarms for this assignment
          if (
            (updatedFields.dueDate && updatedFields.dueDate !== asg.dueDate) ||
            (updatedFields.dueTime && updatedFields.dueTime !== asg.dueTime)
          ) {
            setFiredAlarms((oldFired) => {
              const next = new Set(oldFired);
              for (const k of next) {
                if (k.startsWith(`${id}_`)) {
                  next.delete(k);
                }
              }
              return next;
            });
          }

          return merged;
        }
        return asg;
      })
    );
  }, [setAssignments]);

  const updateAssignmentStatus = useCallback((id, newStatus) => {
    updateAssignment(id, { status: newStatus });
  }, [updateAssignment]);

  const deleteAssignment = useCallback((id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    // Clean up fired alarm keys
    setFiredAlarms((oldFired) => {
      const next = new Set(oldFired);
      for (const k of next) {
        if (k.startsWith(`${id}_`)) {
          next.delete(k);
        }
      }
      return next;
    });
  }, [setAssignments]);

  // --- Tasks CRUD ---
  const addTask = useCallback((task) => {
    const id = task.id || `task-${Date.now()}`;
    const newTask = {
      id,
      title: task.title,
      courseCode: task.courseCode || 'General',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      priority: task.priority || 'Medium',
      completed: false,
      category: task.category || 'Study',
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id, updatedFields) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  }, [setTasks]);

  const toggleTaskCompleted = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  // --- Notes CRUD ---
  const addNote = useCallback((note) => {
    const id = note.id || `note-${Date.now()}`;
    const newNote = {
      id,
      title: note.title || 'Untitled Note',
      courseCode: note.courseCode || 'General',
      courseName: note.courseName || note.courseCode || 'General Subject',
      tags: Array.isArray(note.tags) ? note.tags : [],
      pinned: Boolean(note.pinned),
      updatedAt: new Date().toISOString(),
      content: note.content || '',
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback((id, updatedFields) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updatedFields, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [setNotes]);

  const togglePinNote = useCallback((id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  }, [setNotes]);

  // --- Calendar Events CRUD ---
  const addCalendarEvent = useCallback((event) => {
    const id = event.id || `evt-${Date.now()}`;
    const newEvt = {
      id,
      title: event.title,
      type: event.type || 'study',
      date: event.date,
      startTime: event.startTime || '10:00 AM',
      endTime: event.endTime || '11:00 AM',
      location: event.location || 'Campus / Online',
      courseCode: event.courseCode || 'GEN 101',
      description: event.description || '',
    };
    setCalendarEvents((prev) => [newEvt, ...prev]);
    return newEvt;
  }, [setCalendarEvents]);

  const updateCalendarEvent = useCallback((id, updatedFields) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
  }, [setCalendarEvents]);

  const deleteCalendarEvent = useCallback((id) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  }, [setCalendarEvents]);

  // --- Reminders CRUD ---
  const addReminder = useCallback((rem) => {
    const id = rem.id || `rem-${Date.now()}`;
    const newRem = {
      id,
      title: rem.title,
      category: rem.category || 'Study',
      date: rem.date || new Date().toISOString().split('T')[0],
      time: rem.time || '12:00',
      enabled: rem.enabled !== undefined ? rem.enabled : true,
      sound: rem.sound !== undefined ? rem.sound : true,
      repeat: rem.repeat || 'Never',
      notes: rem.notes || '',
    };
    setReminders((prev) => [newRem, ...prev]);
    return newRem;
  }, [setReminders]);

  const updateReminder = useCallback((id, updatedFields) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
  }, [setReminders]);

  const toggleReminderEnabled = useCallback((id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, [setReminders]);

  const deleteReminder = useCallback((id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, [setReminders]);

  // --- Notification Center Actions ---
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, [setNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const toggleAnnouncementRead = useCallback((id) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  }, [setAnnouncements]);

  const addClassSchedule = useCallback((day, classData) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { id: `tt-${day}-${Date.now()}`, ...classData }],
    }));
  }, [setTimetable]);

  const removeClassSchedule = useCallback((day, classId) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((c) => c.id !== classId),
    }));
  }, [setTimetable]);

  // --- Sound & Permission Utilities ---
  const testSoundChime = useCallback(() => {
    playNotificationChime();
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    const res = await requestBrowserNotificationPermission();
    if (res === 'granted') {
      setNotificationPreferences((prev) => ({
        ...prev,
        browserNotificationsEnabled: true,
      }));
    }
    return res;
  }, [setNotificationPreferences]);

  // =========================================================================
  // AUTOMATED ALARM TICKER ENGINE
  // Evaluates assignment deadlines and custom reminders every 15 seconds.
  // =========================================================================
  const checkAlarms = useCallback(() => {
    const now = Date.now();
    const newNotifications = [];
    let shouldPlaySound = false;

    setFiredAlarms((prevFired) => {
      const updatedFired = new Set(prevFired);

      // 1. Check Assignment Deadlines and Reminders
      assignments.forEach((asg) => {
        // Skip completed or submitted assignments
        if (asg.status === 'Completed' || asg.status === 'Submitted') {
          return;
        }

        const due = parseDueTimestamp(asg.dueDate, asg.dueTime);
        if (!due) return;
        const dueEpoch = due.getTime();
        const diffMs = dueEpoch - now;

        // Check configured reminder intervals
        if (asg.reminderEnabled) {
          const intervals = Array.isArray(asg.reminders) && asg.reminders.length > 0
            ? asg.reminders
            : ['1d', '2h', 'due'];

          intervals.forEach((intervalKey) => {
            const offset = REMINDER_INTERVAL_OFFSETS[intervalKey];
            if (offset === undefined) return;

            const triggerTime = dueEpoch - offset;
            const alarmKey = `${asg.id}_${intervalKey}`;

            // Trigger window: now is past triggerTime, but within a 24-hour freshness window
            if (now >= triggerTime && now - triggerTime < 24 * 60 * 60 * 1000) {
              if (!updatedFired.has(alarmKey)) {
                updatedFired.add(alarmKey);
                shouldPlaySound = true;

                const label = REMINDER_INTERVAL_LABELS[intervalKey] || intervalKey;
                const notifTitle = `Reminder: ${asg.title}`;
                const notifMsg = `${asg.courseCode} assignment is due ${label} (${asg.dueDate} ${asg.dueTime}).`;

                newNotifications.push({
                  id: `alarm-${Date.now()}-${alarmKey}`,
                  title: notifTitle,
                  message: notifMsg,
                  type: 'assignment_alarm',
                  timestamp: 'Just now',
                  isRead: false,
                  link: '/assignments',
                });

                if (notificationPreferences.browserNotificationsEnabled) {
                  sendBrowserNotification(notifTitle, {
                    body: notifMsg,
                    tag: alarmKey,
                    url: '/assignments',
                  });
                }
              }
            }
          });
        }

        // Check for Overdue status
        if (diffMs < 0 && notificationPreferences.autoOverdueAlerts) {
          const overdueKey = `${asg.id}_overdue`;
          if (!updatedFired.has(overdueKey)) {
            updatedFired.add(overdueKey);
            shouldPlaySound = true;

            const notifTitle = `⚠️ Overdue: ${asg.title}`;
            const notifMsg = `The deadline for ${asg.courseCode} (${asg.title}) has passed. Submit immediately to minimize penalties.`;

            newNotifications.push({
              id: `overdue-${Date.now()}-${asg.id}`,
              title: notifTitle,
              message: notifMsg,
              type: 'overdue',
              timestamp: 'Just now',
              isRead: false,
              link: '/assignments',
            });

            if (notificationPreferences.browserNotificationsEnabled) {
              sendBrowserNotification(notifTitle, {
                body: notifMsg,
                tag: overdueKey,
                url: '/assignments',
              });
            }
          }
        }
      });

      // 2. Check Custom Reminders
      reminders.forEach((rem) => {
        if (!rem.enabled) return;
        const target = parseDueTimestamp(rem.date, rem.time);
        if (!target) return;
        const targetEpoch = target.getTime();
        const remKey = `rem_${rem.id}_${rem.date}`;

        if (now >= targetEpoch && now - targetEpoch < 24 * 60 * 60 * 1000) {
          if (!updatedFired.has(remKey)) {
            updatedFired.add(remKey);
            if (rem.sound) shouldPlaySound = true;

            const notifTitle = `🔔 Reminder: ${rem.title}`;
            const notifMsg = rem.notes || `Scheduled for today at ${rem.time}`;

            newNotifications.push({
              id: `custom-rem-${Date.now()}-${rem.id}`,
              title: notifTitle,
              message: notifMsg,
              type: 'reminder',
              timestamp: 'Just now',
              isRead: false,
              link: '/reminders',
            });

            if (notificationPreferences.browserNotificationsEnabled) {
              sendBrowserNotification(notifTitle, {
                body: notifMsg,
                tag: remKey,
                url: '/reminders',
              });
            }
          }
        }
      });

      return updatedFired;
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev]);
    }

    if (shouldPlaySound && notificationPreferences.soundEnabled) {
      playNotificationChime();
    }
  }, [
    assignments,
    reminders,
    notificationPreferences.browserNotificationsEnabled,
    notificationPreferences.soundEnabled,
    notificationPreferences.autoOverdueAlerts,
    setNotifications,
  ]);

  // Periodic Ticker & Focus/Visibility Wakeup
  useEffect(() => {
    // Run immediately on mount
    checkAlarms();

    const interval = setInterval(checkAlarms, 15000); // Check every 15s

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAlarms();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkAlarms);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkAlarms);
    };
  }, [checkAlarms]);

  // Derived counts
  const pendingAssignmentsCount = useMemo(
    () => assignments.filter((a) => a.status === 'In Progress' || a.status === 'Not Started').length,
    [assignments]
  );

  const completedAssignmentsCount = useMemo(
    () => assignments.filter((a) => a.status === 'Completed' || a.status === 'Submitted').length,
    [assignments]
  );

  const overdueAssignmentsCount = useMemo(() => {
    const now = Date.now();
    return assignments.filter((a) => {
      if (a.status === 'Completed' || a.status === 'Submitted') return false;
      const due = parseDueTimestamp(a.dueDate, a.dueTime);
      return due && due.getTime() < now;
    }).length;
  }, [assignments]);

  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const unreadCount = unreadNotificationsCount;

  return (
    <AppContext.Provider
      value={{
        // State
        student,
        setStudent,
        subjects,
        setSubjects,
        assignments,
        setAssignments,
        tasks,
        setTasks,
        notes,
        setNotes,
        calendarEvents,
        setCalendarEvents,
        reminders,
        setReminders,
        notifications,
        setNotifications,
        notificationPreferences,
        setNotificationPreferences,
        timetable,
        setTimetable,
        announcements,
        setAnnouncements,
        theme,
        toggleTheme,

        // Counts
        pendingAssignmentsCount,
        completedAssignmentsCount,
        overdueAssignmentsCount,
        pendingTasksCount,
        unreadNotificationsCount,
        unreadCount,
        attendanceStats,

        // Actions
        addAssignment,
        updateAssignment,
        updateAssignmentStatus,
        deleteAssignment,
        addTask,
        updateTask,
        toggleTaskCompleted,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addReminder,
        updateReminder,
        toggleReminderEnabled,
        deleteReminder,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        toggleAnnouncementRead,
        addClassSchedule,
        removeClassSchedule,
        logAttendance,
        testSoundChime,
        requestBrowserPermission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

