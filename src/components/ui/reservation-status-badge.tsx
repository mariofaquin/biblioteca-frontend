'use client'

import { useMemo } from 'react'

interface ReservationStatusBadgeProps {
  status: string
  expiresAt?: string | null
  availableSince?: string | null
}

function getHoursUntilExpiry(expiresAt?: string | null): number {
  if (!expiresAt) return 0
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - now.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ReservationStatusBadge({ 
  status, 
  expiresAt, 
  availableSince 
}: ReservationStatusBadgeProps) {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'pending':
      case 'waiting':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: '⏳', 
          text: 'Aguardando' 
        }
      
      case 'available':
      case 'ready':
        const hoursLeft = getHoursUntilExpiry(expiresAt)
        if (hoursLeft < 12) {
          return { 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
            icon: '⚠️', 
            text: `Expira em ${hoursLeft}h` 
          }
        }
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: '✅', 
          text: 'Disponível para Retirada' 
        }
      
      case 'cancelled_timeout':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: '❌', 
          text: 'Cancelada - Não Retirado' 
        }
      
      case 'fulfilled':
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: '✅', 
          text: 'Retirado' 
        }
      
      case 'cancelled':
      case 'cancelled_user':
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: '⚪', 
          text: 'Cancelada' 
        }
      
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: '⚪', 
          text: status 
        }
    }
  }, [status, expiresAt])
  
  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${statusConfig.color}`}>
      <span className="text-sm font-medium">
        {statusConfig.icon} {statusConfig.text}
      </span>
      {expiresAt && (status === 'available' || status === 'ready') && (
        <div className="text-xs mt-1 ml-2 border-l pl-2 border-current">
          Retire até: {formatDate(expiresAt)}
        </div>
      )}
    </div>
  )
}
