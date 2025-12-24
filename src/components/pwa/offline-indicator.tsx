'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50 shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <span className="animate-pulse">📴</span>
        <span>Você está offline - Algumas funcionalidades podem estar limitadas</span>
      </div>
    </div>
  );
}
