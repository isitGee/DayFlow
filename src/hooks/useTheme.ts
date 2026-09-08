import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export function useTheme() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    function apply() {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches);
      root.classList.toggle('dark', isDark);
    }

    apply();
    if (theme === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [theme]);
}
