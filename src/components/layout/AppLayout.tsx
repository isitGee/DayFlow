import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav, MobileTopBar } from './MobileNav';
import { QuickAddModal } from '../tasks/QuickAddModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { FocusMode } from '../planner/FocusMode';
import { CommandPalette } from '../CommandPalette';
import { ToastContainer } from '../ui/ToastContainer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useTheme } from '../../hooks/useTheme';
import { useTaskNotifications } from '../../hooks/useTaskNotifications';
import { useAuth } from '../../hooks/useAuth';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export function AppLayout() {
  useTheme();
  useKeyboardShortcuts();
  useTaskNotifications();

  const { user } = useAuth();
  const loadRemote = useTaskStore((s) => s.loadRemote);
  const remoteLoaded = useTaskStore((s) => s.remoteLoaded);
  const setCurrentUserId = useTaskStore((s) => s.setCurrentUserId);
  const loadGoalsRemote = useGoalStore((s) => s.loadRemote);
  const goalsRemoteLoaded = useGoalStore((s) => s.remoteLoaded);
  const setGoalsUserId = useGoalStore((s) => s.setCurrentUserId);

  useEffect(() => {
    if (!user) return;
    if (isSupabaseConfigured) {
      if (!remoteLoaded) loadRemote(user.id);
      if (!goalsRemoteLoaded) loadGoalsRemote(user.id);
    } else {
      setCurrentUserId(user.id);
      setGoalsUserId(user.id);
    }
  }, [user, remoteLoaded, loadRemote, setCurrentUserId, goalsRemoteLoaded, loadGoalsRemote, setGoalsUserId]);

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <MobileTopBar />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>

      <QuickAddModal />
      <TaskDetailModal />
      <FocusMode />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
