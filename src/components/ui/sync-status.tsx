'use client'

import { useSyncStatus } from '@/hooks/use-sync-status'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock } from 'lucide-react'

export function SyncStatus() {
  const { syncStatus, isOnline, forceSync } = useSyncStatus()

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Status de conectividade */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Status de sincronização */}
      {syncStatus.pending > 0 ? (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {syncStatus.pending} pendente{syncStatus.pending > 1 ? 's' : ''}
        </Badge>
      ) : (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Sincronizado
        </Badge>
      )}

      {/* Botão de sincronização forçada */}
      {syncStatus.pending > 0 && isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={forceSync}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}

      {/* Última sincronização */}
      {syncStatus.lastSync && (
        <span className="text-muted-foreground text-xs">
          Última sync: {syncStatus.lastSync}
        </span>
      )}
    </div>
  )
}