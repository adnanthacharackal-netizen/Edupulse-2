// src/services/notificationService.js
// Handles Web Audio Chime, Browser Notifications API, Capacitor Local Notifications bridge,
// and Assignment Due-Date Alarm calculations.

/**
 * Plays a clean synthesizer chime using the Web Audio API.
 * Works reliably in modern browsers without needing external audio asset files.
 */
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const tones = [
      { freq: 523.25, time: 0.00, duration: 0.18 },
      { freq: 659.25, time: 0.12, duration: 0.18 },
      { freq: 783.99, time: 0.24, duration: 0.35 },
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Envelope: smooth attack and decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration + 0.05);
    });

    // Close audio context after playback finishes
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    }, 800);
  } catch (err) {
    console.warn('[NotificationService] Audio chime playback skipped:', err);
  }
}

/**
 * Check if the current browser environment supports the Web Notifications API.
 */
export function isBrowserNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status ('default' | 'granted' | 'denied').
 */
export function getBrowserNotificationPermission() {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the student.
 */
export async function requestBrowserNotificationPermission() {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[NotificationService] Error requesting permission:', err);
    return 'denied';
  }
}

/**
 * Display a native browser notification (if permission was granted).
 */
export function sendBrowserNotification(title, options = {}) {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notif = new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: options.tag || 'edupulse-alarm',
      renotify: true,
      silent: false,
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('[NotificationService] Failed to trigger browser notification:', err);
    return null;
  }
}

/**
 * Bridge for Capacitor native local notifications when exported to Android.
 * Gracefully falls back if Capacitor is not present.
 */
export async function scheduleCapacitorNotification({ id, title, body, scheduleAt }) {
  if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.LocalNotifications) {
    try {
      const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Number(String(id).replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            title,
            body,
            schedule: { at: new Date(scheduleAt) },
            channelId: 'edupulse_academic_reminders',
            sound: 'beep.wav',
            smallIcon: 'ic_stat_name',
          },
        ],
      });
    } catch (err) {
      console.warn('[NotificationService] Capacitor local notification error:', err);
    }
  }
}

/**
 * Helper to parse dueDate ('YYYY-MM-DD') and dueTime ('11:59 PM' or '23:59') into a Date object.
 */
export function parseDueTimestamp(dueDate, dueTime = '23:59') {
  if (!dueDate) return null;

  try {
    let hours = 23;
    let minutes = 59;

    if (dueTime) {
      const trimmed = dueTime.trim();
      const is12Hour = /AM|PM/i.test(trimmed);

      if (is12Hour) {
        const parts = trimmed.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (parts) {
          hours = parseInt(parts[1], 10);
          minutes = parseInt(parts[2], 10);
          const period = parts[3].toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      } else {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          hours = parseInt(parts[0], 10) || 0;
          minutes = parseInt(parts[1], 10) || 0;
        }
      }
    }

    const [year, month, day] = dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    console.error('[NotificationService] Error parsing date:', e);
    return null;
  }
}

/**
 * Human-readable countdown string.
 * e.g., "Due in 2 days, 4 hours", "Due in 45 minutes", "Overdue by 3 hours".
 */
export function getDeadlineCountdown(dueDate, dueTime) {
  const due = parseDueTimestamp(dueDate, dueTime);
  if (!due) return { text: 'No deadline', isOverdue: false, diffMs: 0 };

  const now = Date.now();
  const diffMs = due.getTime() - now;

  if (diffMs < 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueMinutes = Math.floor(overdueMs / (1000 * 60));
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));

    let text = '';
    if (overdueDays > 0) {
      const remHours = overdueHours % 24;
      text = `Overdue by ${overdueDays}d ${remHours}h`;
    } else if (overdueHours > 0) {
      const remMins = overdueMinutes % 60;
      text = `Overdue by ${overdueHours}h ${remMins}m`;
    } else {
      text = `Overdue by ${Math.max(1, overdueMinutes)} mins`;
    }

    return { text, isOverdue: true, diffMs };
  }

  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let text = '';
  if (days > 1) {
    const remHours = hours % 24;
    text = `Due in ${days} days, ${remHours} hrs`;
  } else if (days === 1) {
    const remHours = hours % 24;
    text = `Due tomorrow (${remHours}h remaining)`;
  } else if (hours > 0) {
    const remMins = mins % 60;
    text = `Due in ${hours}h ${remMins}m`;
  } else if (mins > 0) {
    text = `Due in ${mins} minutes!`;
  } else {
    text = 'Due right now!';
  }

  return { text, isOverdue: false, diffMs };
}

/**
 * Standard interval offsets in milliseconds.
 */
export const REMINDER_INTERVAL_OFFSETS = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1d': 1 * 24 * 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  'due': 0,
};

export const REMINDER_INTERVAL_LABELS = {
  '7d': '7 days before',
  '3d': '3 days before',
  '1d': '1 day before',
  '2h': '2 hours before',
  '30m': '30 minutes before',
  'due': 'At exact deadline',
};

/**
 * Calculate scheduled reminder timestamps for an assignment based on selected intervals.
 */
export function getScheduledRemindersForAssignment(assignment) {
  if (!assignment.reminderEnabled && assignment.reminderEnabled !== undefined) {
    return [];
  }
  const due = parseDueTimestamp(assignment.dueDate, assignment.dueTime);
  if (!due) return [];

  const intervals = Array.isArray(assignment.reminders) && assignment.reminders.length > 0
    ? assignment.reminders
    : ['1d', '2h', 'due'];

  const list = [];
  intervals.forEach((key) => {
    const offset = REMINDER_INTERVAL_OFFSETS[key];
    if (offset !== undefined) {
      const triggerTime = due.getTime() - offset;
      list.push({
        intervalKey: key,
        label: REMINDER_INTERVAL_LABELS[key] || key,
        triggerTime,
        triggerDate: new Date(triggerTime),
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        courseCode: assignment.courseCode,
      });
    }
  });

  return list;
}
