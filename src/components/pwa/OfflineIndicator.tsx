import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-[#F59E0B] bg-[#FFFBEB] px-3.5 py-2 text-xs font-bold text-[#92400E] shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-[#D97706]" aria-hidden="true" />
      <span>Offline Mode — Cached hospital data active</span>
    </div>
  );
}
