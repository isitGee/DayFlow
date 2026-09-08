import { NavLink, useLocation } from 'react-router-dom';
import { CalendarDays, Inbox, LayoutGrid, MoreHorizontal, Plus, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';

const ITEMS = [
  { to: '/app/today', label: 'Today', icon: Sun },
  { to: '/app/inbox', label: 'Inbox', icon: Inbox },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/projects', label: 'Projects', icon: LayoutGrid },
  { to: '/app/settings', label: 'More', icon: MoreHorizontal },
];

const TITLES: Record<string, string> = {
  '/app/today': 'Today',
  '/app/inbox': 'Inbox',
  '/app/calendar': 'Calendar',
  '/app/projects': 'Projects',
  '/app/goals': 'Goals',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
};

export function MobileTopBar() {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? 'DAYFLOW';
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface/90 px-4 backdrop-blur md:hidden">
      <div className="flex items-center gap-1.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 13.5 9.5 19 20 5" stroke="#2b7de9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[15px] font-semibold text-ink">{title}</span>
      </div>
    </header>
  );
}

export function MobileNav() {
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  return (
    <>
      <button
        onClick={() => setQuickAddOpen(true)}
        aria-label="Quick capture"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-raised active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border-subtle bg-surface/95 backdrop-blur md:hidden">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-ink-faint', isActive && 'text-accent-600')
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
