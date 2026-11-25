import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#BFD7F2] bg-[#F8FBFF] px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DCE8F7] bg-white text-[#0070F3] shadow-sm">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-[#05080F]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#334155]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#005DD1]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to render telemetry view',
  description = 'A temporary display error interrupted loading. Retry to restore the local dataset.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#FECDD3] bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-[#05080F]">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-[#334155]">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-4 py-2 text-xs font-semibold text-[#05080F] transition-colors hover:border-[#0070F3] hover:text-[#0070F3]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry View
        </button>
      )}
    </div>
  );
}
