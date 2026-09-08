import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const quickAddOpen = useUIStore((s) => s.quickAddOpen);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (cmdK) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (quickAddOpen) setQuickAddOpen(false);
        return;
      }

      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setQuickAddOpen(true);
          break;
        case 't':
          navigate('/app/today');
          break;
        case 'i':
          navigate('/app/inbox');
          break;
        case 'c':
          navigate('/app/calendar');
          break;
        case 'g':
          navigate('/app/goals');
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, setQuickAddOpen, setCommandPaletteOpen, commandPaletteOpen, quickAddOpen]);
}
