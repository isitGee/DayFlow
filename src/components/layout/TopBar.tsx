import { useLocation } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { NotificationBell } from './NotificationBell';

const TITLES: Record<string, string> = {
  '/app/today': 'Today',
  '/app/inbox': 'Inbox',
  '/app/calendar': 'Calendar',
  '/app/projects': 'Projects',
  '/app/goals': 'Goals',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
};

function titleForPath(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/app/projects/')) return 'Project';
  return 'DAYFLOW';
}

export function TopBar() {
  const location = useLocation();
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border-subtle bg-surface/90 px-6 backdrop-blur md:flex">
      <h1 className="text-[17px] font-semibold text-ink">{titleForPath(location.pathname)}</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-9 w-64 items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 text-sm text-ink-faint hover:border-accent-300"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search or run a command</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-ink-faint">⌘K</kbd>
        </button>
        <Button variant="primary" size="sm" onClick={() => setQuickAddOpen(true)}>
          <Plus className="h-4 w-4" /> Quick add
        </Button>
        <NotificationBell />
      </div>
    </header>
  );
}
