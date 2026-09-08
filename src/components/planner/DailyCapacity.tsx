import type { Workload } from '../../types';
import { capacityStatus, capacityMessage } from '../../services/scheduleService';
import { cn, formatMinutes } from '../../lib/utils';

const STATUS_BAR: Record<string, string> = {
  healthy: 'bg-healthy',
  caution: 'bg-caution',
  overloaded: 'bg-overloaded',
};

const STATUS_TEXT: Record<string, string> = {
  healthy: 'text-healthy',
  caution: 'text-caution',
  overloaded: 'text-overloaded',
};

export function DailyCapacity({ workload }: { workload: Workload }) {
  const status = capacityStatus(workload.capacityPercentage);
  const barWidth = Math.min(100, workload.capacityPercentage);
  const overflowWidth = workload.capacityPercentage > 100 ? Math.min(30, workload.capacityPercentage - 100) : 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">Daily capacity</p>
        <span className={cn('text-sm font-semibold', STATUS_TEXT[status])}>{workload.capacityPercentage}% planned</span>
      </div>

      <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-300', STATUS_BAR[status])} style={{ width: `${barWidth}%` }} />
        {overflowWidth > 0 && (
          <div
            className="absolute inset-y-0 rounded-r-full bg-overloaded/60"
            style={{ left: '100%', width: `${overflowWidth}%`, transform: 'translateX(-100%)' }}
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink"><strong className="font-semibold">{formatMinutes(workload.plannedMinutes)}</strong> planned</span>
        <span className="text-ink-muted">{formatMinutes(workload.availableMinutes)} available</span>
        <span className={cn(workload.remainingMinutes < 0 ? 'text-overloaded' : 'text-ink-muted')}>
          {workload.remainingMinutes < 0 ? `${formatMinutes(Math.abs(workload.remainingMinutes))} over` : `${formatMinutes(workload.remainingMinutes)} left`}
        </span>
      </div>

      <p className="mt-3 text-sm text-ink-muted">{capacityMessage(workload)}</p>
    </div>
  );
}
