'use client'

import { useState, useEffect, useCallback } from 'react'
import { reservationService, Reservation, ReservationQueue } from '@/lib/services/reservations'
import { useCompany } from '@/hooks/use-company'

export function useReservations() {
  const { selectedCompany, user } = useCompany()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadReservations = useCallback(async () => {
    if (!selectedCompany || !user) return

    setIsLoading(true)
    try {
      console.log('📡 Buscando reservas da API...')
      console.log('🏢 Company ID:', selectedCompany.id)
      
      // Buscar da API em vez do localStorage
      const response = await fetch(`/api/reservations?user_id=${user.id}`, {
        headers: {
          'x-company-id': selectedCompany.id
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar reservas')
      }
      
      console.log('✅ Reservas recebidas da API:', data.data)
      
      // Converter para o formato esperado
      const apiReservations: Reservation[] = (data.data || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_email: r.user_email,
        book_id: r.book_id,
        book_title: r.book_title,
        book_author: r.book_author,
        book_isbn: r.book_isbn || '',
        book_cover_image: r.book_cover_image || '',
        company_id: selectedCompany.id,
        company_name: r.company_name || selectedCompany.name,
        reserved_at: r.created_at,
        status: r.status,
        position_in_queue: 1,
        notified_at: r.notified_at
      }))
      
      setReservations(apiReservations)
      
    } catch (error) {
      console.error('❌ Erro ao carregar reservas da API:', error)
      
      // Fallback para localStorage
      console.log('⚠️ Usando fallback do localStorage')
      const userReservations = reservationService.getUserReservations(user.id, selectedCompany.id)
      setReservations(userReservations)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCompany, user])

  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  const createReservation = async (bookData: {
    book_id: string
    book_title: string
    book_author: string
    book_isbn: string
    book_cover_image?: string
  }) => {
    if (!selectedCompany || !user) {
      throw new Error('Usuário ou empresa não identificados')
    }

    try {
      const reservation = await reservationService.createReservation({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        company_id: selectedCompany.id,
        company_name: selectedCompany.name,
        ...bookData
      })

      await loadReservations()
      return reservation
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error)
      throw error
    }
  }

  const cancelReservation = async (reservationId: string) => {
    try {
      const success = reservationService.cancelReservation(reservationId)
      if (success) {
        await loadReservations()
      }
      return success
    } catch (error) {
      console.error('❌ Erro ao cancelar reserva:', error)
      throw error
    }
  }

  const getBookQueue = (bookId: string): ReservationQueue | null => {
    if (!selectedCompany) return null
    return reservationService.getBookQueue(bookId, selectedCompany.id)
  }

  const getUserPosition = (bookId: string): number | null => {
    if (!user || !selectedCompany) return null
    
    const queue = reservationService.getBookQueue(bookId, selectedCompany.id)
    const userReservation = queue.reservations.find(r => r.user_id === user.id)
    
    return userReservation?.position_in_queue || null
  }

  return {
    reservations,
    isLoading,
    createReservation,
    cancelReservation,
    getBookQueue,
    getUserPosition,
    refreshReservations: loadReservations
  }
}

// Hook para administradores gerenciarem reservas da empresa
export function useCompanyReservations() {
  const { selectedCompany } = useCompany()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCompanyReservations = async () => {
    if (!selectedCompany) return

    setIsLoading(true)
    try {
      const companyReservations = reservationService.getReservationsByCompany(selectedCompany.id)
      setReservations(companyReservations)
    } catch (error) {
      console.error('❌ Erro ao carregar reservas da empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanyReservations()
  }, [selectedCompany?.id, loadCompanyReservations])

  const processBookReturn = async (bookId: string) => {
    if (!selectedCompany) return null

    try {
      const nextReservation = reservationService.processBookReturn(bookId, selectedCompany.id)
      
      if (nextReservation) {
        // Notificar usuário
        reservationService.notifyUser(nextReservation)
        
        // Recarregar reservas
        await loadCompanyReservations()
      }
      
      return nextReservation
    } catch (error) {
      console.error('❌ Erro ao processar devolução:', error)
      throw error
    }
  }

  const getCompanyStats = () => {
    if (!selectedCompany) return null
    return reservationService.getCompanyStats(selectedCompany.id)
  }

  return {
    reservations,
    isLoading,
    processBookReturn,
    getCompanyStats,
    refreshReservations: loadCompanyReservations
  }
}