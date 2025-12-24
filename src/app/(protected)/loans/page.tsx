'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LoanList } from '@/components/loans/loan-list'
import { CreateLoanForm } from '@/components/loans/create-loan-form'

export default function LoansPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidar cache de empréstimos quando a página carregar
    console.log('🔄 Invalidando cache de empréstimos e reservas...')
    
    // Invalidação mais agressiva
    queryClient.removeQueries({ queryKey: ['loans'] })
    queryClient.removeQueries({ queryKey: ['reservations'] })
    
    // Forçar refetch
    queryClient.invalidateQueries({ queryKey: ['loans'] })
    queryClient.invalidateQueries({ queryKey: ['reservations'] })
    
    // Escutar evento de reserva criada
    const handleReservationCreated = () => {
      console.log('🔄 Evento de reserva criada detectado, invalidando cache...')
      queryClient.removeQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    }
    
    window.addEventListener('reservationCreated', handleReservationCreated)
    
    return () => {
      window.removeEventListener('reservationCreated', handleReservationCreated)
    }
  }, [queryClient])

  return (
    <div className="space-y-6">
      <CreateLoanForm />
      <LoanList />
    </div>
  )
}