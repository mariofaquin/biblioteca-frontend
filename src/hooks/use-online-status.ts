'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verificar status inicial
    setIsOnline(navigator.onLine);

    // Handlers para mudanças de status
    const handleOnline = () => {
      console.log('🌐 Voltou online!');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Ficou offline!');
      setIsOnline(false);
    };

    // Adicionar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
