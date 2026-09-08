import { NavLink } from 'react-router-dom';
import {
  CalendarDays, ChevronsLeft, ChevronsRight, Inbox, LayoutGrid, Settings,
  Sparkles, Sun, Target, User,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';

const NAV_ITEMS = [
  { to: '/app/today', label: 'Today', icon: Sun },
  { to: '/app/inbox', label: 'Inbox', icon: Inbox },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/projects', label: 'Projects', icon: LayoutGrid },
  { to: '/app/goals', label: 'Goals', icon: Target },
  { to: '/app/analytics', label: 'Analytics', icon: Sparkles },
];

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 px-1', collapsed && 'justify-center')}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M4 13.5 9.5 19 20 5" stroke="#2b7de9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!collapsed && <span className="text-[15px] font-bold tracking-tight text-ink">DAYFLOW</span>}
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const projects = useTaskStore((s) => s.projects);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle bg-surface transition-[width] duration-200 md:flex',
        collapsed ? 'w-[68px]' : 'w-[248px]'
      )}
    >
      <div className="flex items-center justify-between px-3 pt-4">
        <Logo collapsed={collapsed} />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink',
                collapsed && 'justify-center px-0',
                isActive && 'bg-accent-50 text-accent-700 hover:bg-accent-50 hover:text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 dark:hover:bg-accent-900/30'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <div className="mt-6 px-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">My Projects</p>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/app/projects/${p.id}`}
              title={collapsed ? p.name : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink',
                  collapsed && 'justify-center px-0',
                  isActive && 'bg-surface-sunken text-ink'
                )
              }
            >
              <span className="text-[15px] leading-none">{p.icon}</span>
              {!collapsed && <span className="truncate">{p.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-border-subtle p-2">
        <NavLink
          to="/app/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink',
              collapsed && 'justify-center px-0',
              isActive && 'bg-surface-sunken text-ink'
            )
          }
        >
          <Settings className="h-[18px] w-[18px]" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <div className={cn('mt-1 flex items-center gap-3 rounded-lg px-3 py-2', collapsed && 'justify-center px-0')}>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            <User className="h-3.5 w-3.5" />
          </div>
          {!collapsed && <span className="truncate text-sm text-ink-muted">Alex's workspace</span>}
        </div>
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-faint hover:bg-surface-sunken hover:text-ink',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
