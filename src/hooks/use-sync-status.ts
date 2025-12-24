'use client'

import { useState, useEffect } from 'react'
import { booksService } from '@/lib/services/books'

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<{ pending: number; lastSync: string | null }>({ pending: 0, lastSync: null })
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Verificar status inicial
    updateSyncStatus()

    // Verificar conectividade
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Atualizar status periodicamente
    const interval = setInterval(updateSyncStatus, 5000)

    // Listeners para mudanças de conectividade
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  const updateSyncStatus = () => {
    const status = booksService.getSyncStatus()
    setSyncStatus(status)
  }

  const forceSync = async () => {
    try {
      await booksService.forcSync()
      updateSyncStatus()
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error)
    }
  }

  return {
    syncStatus,
    isOnline,
    forceSync,
    updateSyncStatus
  }
}