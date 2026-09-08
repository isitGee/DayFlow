import { useUIStore } from '../../store/uiStore';

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 shadow-raised animate-slide-up"
        >
          <span className="text-sm text-ink">{t.message}</span>
          {t.actionLabel && (
            <button
              onClick={() => {
                t.onAction?.();
                dismissToast(t.id);
              }}
              className="text-sm font-semibold text-accent-600 hover:text-accent-700"
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
