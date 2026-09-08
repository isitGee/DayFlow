export type NotificationKind =
  | 'upcoming_task'
  | 'task_starting'
  | 'break'
  | 'daily_planning_reminder'
  | 'end_of_day_review'
  | 'overdue_task';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

/**
 * In demo mode this is an in-memory/in-app notification feed. A production
 * build would swap this for real browser Notifications + a Supabase-backed
 * schedule, without changing how callers construct notifications.
 */
class NotificationService {
  private listeners: Array<(n: AppNotification) => void> = [];

  subscribe(fn: (n: AppNotification) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  emit(kind: NotificationKind, title: string, body: string) {
    const notification: AppNotification = {
      id: `notif_${Math.random().toString(36).slice(2, 9)}`,
      kind,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.listeners.forEach((l) => l(notification));
    return notification;
  }
}

export const notificationService = new NotificationService();
