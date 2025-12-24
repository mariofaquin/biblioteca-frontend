'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [localStats, setLocalStats] = useState({ books: 0, users: 0 })

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        setIsOffline(!response.ok)
      } catch {
        setIsOffline(true)
      }
    }

    const updateLocalStats = () => {
      if (typeof window !== 'undefined') {
        try {
          const data = JSON.parse(localStorage.getItem('biblioteca_multiempresa_data') || '{}')
          setLocalStats({
            books: data.books?.length || 0,
            users: data.users?.length || 0
          })
        } catch {
          setLocalStats({ books: 0, users: 0 })
        }
      }
    }

    // Verificar imediatamente
    checkApiStatus()
    updateLocalStats()

    // Verificar a cada 30 segundos
    const interval = setInterval(() => {
      checkApiStatus()
      updateLocalStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!isOffline || isDismissed) return null

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Modo Offline:</strong> Backend não disponível. 
          Todos os dados estão sendo <strong>salvos localmente</strong> e serão sincronizados automaticamente quando o backend for ativado.
          <br />
          <small className="text-orange-600">
            📦 Sistema funcionando normalmente • {localStats.books} livros • {localStats.users} usuários salvos localmente
          </small>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}