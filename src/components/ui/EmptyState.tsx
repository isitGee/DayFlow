import React from 'react';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
