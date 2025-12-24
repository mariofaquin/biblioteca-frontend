'use client'

import { useEffect } from 'react'
import { initializeReservationNotifier } from '@/lib/reservation-notifier'

export function ReservationNotifierInit() {
  useEffect(() => {
    // Inicializar sistema de notificação
    initializeReservationNotifier()
  }, [])
  
  return null
}
