import { useEffect, useRef } from 'react';
import { differenceInMinutes, format, isBefore } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { usePlannerStore } from '../store/plannerStore';
import { notificationService } from '../services/notificationService';

const CHECK_INTERVAL_MS = 30_000;
const UPCOMING_WINDOW_MINUTES = 5;

/**
 * Local, in-browser notification scheduling for the notification
 * architecture described in the product spec (upcoming task, task starting,
 * overdue task, daily planning reminder). This intentionally does not
 * require a server: it re-evaluates today's schedule every 30s while the
 * tab is open. A production build would move this server-side (or to a
 * service worker) so notifications still fire when the tab is closed, but
 * the notificationService/emit contract this hook uses would stay the same.
 */
export function useTaskNotifications() {
  const tasks = useTaskStore((s) => s.tasks);
  const notificationsEnabled = usePlannerStore((s) => s.settings.notificationsEnabled);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!notificationsEnabled) return;

    function check() {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      tasks
        .filter((t) => t.scheduledDate === today && t.status !== 'completed' && t.status !== 'archived' && t.scheduledStart)
        .forEach((t) => {
          const start = new Date(t.scheduledStart!);
          const minutesUntil = differenceInMinutes(start, now);
          const upcomingKey = `upcoming:${t.id}`;
          const startingKey = `starting:${t.id}`;
          const overdueKey = `overdue:${t.id}`;

          if (minutesUntil > 0 && minutesUntil <= UPCOMING_WINDOW_MINUTES && !notifiedRef.current.has(upcomingKey)) {
            notifiedRef.current.add(upcomingKey);
            fire('upcoming_task', 'Coming up', `"${t.title}" starts in ${minutesUntil}m.`);
          } else if (minutesUntil <= 0 && minutesUntil > -1 && !notifiedRef.current.has(startingKey)) {
            notifiedRef.current.add(startingKey);
            fire('task_starting', 'Starting now', `Time to start "${t.title}".`);
          } else if (t.dueDate && isBefore(new Date(t.dueDate), now) && !notifiedRef.current.has(overdueKey)) {
            notifiedRef.current.add(overdueKey);
            fire('overdue_task', 'This one slipped', `"${t.title}" was due earlier. Want to move it?`);
          }
        });
    }

    function fire(kind: Parameters<typeof notificationService.emit>[0], title: string, body: string) {
      notificationService.emit(kind, title, body);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [tasks, notificationsEnabled]);
}
