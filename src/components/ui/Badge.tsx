import React from 'react';
import { cn } from '../../lib/utils';

type Tone = 'neutral' | 'accent' | 'healthy' | 'caution' | 'overloaded';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  healthy: 'bg-healthy/10 text-healthy',
  caution: 'bg-caution/10 text-caution',
  overloaded: 'bg-overloaded/10 text-overloaded',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
