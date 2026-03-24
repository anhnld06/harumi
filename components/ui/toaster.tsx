'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';
import { cn } from '@/lib/utils';

const TOAST_DURATION = 3000;

export function Toaster() {
  const { message, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="alert"
      className={cn(
        'fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg',
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-300'
      )}
    >
      <Info className="h-5 w-5 shrink-0 text-primary" />
      <p className="text-sm font-medium">{message}</p>
    </div>,
    document.body
  );
}
