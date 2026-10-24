'use client';

import { AlertTriangle, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDestructive = variant === 'destructive';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150"
    >
      <div className="animate-in zoom-in-95 flex w-full max-w-md flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isDestructive ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'
              }`}
            >
              {isDestructive ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
            </div>
            <h2 id="confirm-dialog-title" className="text-base font-bold text-foreground">
              {title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Tutup dialog"
            className="size-8 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses…' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
