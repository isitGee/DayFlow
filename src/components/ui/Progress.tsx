import { cn } from '../../lib/utils';

export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-sunken', className)}>
      <div
        className={cn('h-full rounded-full bg-accent-500 transition-all duration-300 ease-out', barClassName)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
