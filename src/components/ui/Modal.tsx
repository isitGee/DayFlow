import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function Modal({ open, onClose, title, children, className, hideHeader }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[10vh] sm:pt-[14vh]">
      <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl border border-border bg-surface-raised shadow-raised animate-slide-up',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {!hideHeader && (
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-ink-faint hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
