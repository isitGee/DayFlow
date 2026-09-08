import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationService, type AppNotification } from '../../services/notificationService';
import { cn } from '../../lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return notificationService.subscribe((n) => setItems((prev) => [n, ...prev].slice(0, 20)));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setItems((prev) => prev.map((i) => ({ ...i, read: true })));
        }}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-overloaded" />}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-border bg-surface-raised shadow-raised animate-slide-up">
          <div className="border-b border-border-subtle px-4 py-2.5 text-sm font-semibold text-ink">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-faint">Nothing yet. We'll let you know when something needs your attention.</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={cn('border-b border-border-subtle px-4 py-3 last:border-0', !n.read && 'bg-accent-50/50 dark:bg-accent-900/10')}>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
