'use client'

import React from 'react'
import { Clock, BookOpen, Building, X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useReservations } from '@/hooks/use-reservations'
import { useCompany } from '@/hooks/use-company'

export function ReservationList() {
  const { reservations, isLoading, cancelReservation, getBookQueue } = useReservations()
  const { selectedCompany } = useCompany()

  const handleCancelReservation = async (reservationId: string, bookTitle: string) => {
    if (confirm(`Tem certeza que deseja cancelar sua reserva do livro "${bookTitle}"?`)) {
      try {
        await cancelReservation(reservationId)
        alert('Reserva cancelada com sucesso!')
      } catch (error) {
        alert('Erro ao cancelar reserva. Tente novamente.')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Aguardando
          </span>
        )
      case 'ready':
      case 'available':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Disponível!
          </span>
        )
      case 'cancelled':
      case 'cancelled_user':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Cancelada
          </span>
        )
      case 'cancelled_timeout':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Cancelada - Não Retirado
          </span>
        )
      case 'fulfilled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Emprestado
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeReservations = reservations.filter(r => r.status === 'waiting' || r.status === 'ready' || r.status === 'available')
  const historyReservations = reservations.filter(r => r.status === 'cancelled' || r.status === 'cancelled_user' || r.status === 'cancelled_timeout' || r.status === 'fulfilled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Reservas</h1>
        <p className="text-muted-foreground">
          Gerencie suas reservas de livros em {selectedCompany?.name}
        </p>
      </div>

      {/* Reservas Ativas */}
      {activeReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reservas Ativas</h2>
          <div className="grid gap-4">
            {activeReservations.map((reservation) => {
              const queue = getBookQueue(reservation.book_id)
              
              return (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {reservation.book_cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={reservation.book_cover_image} 
                              alt={reservation.book_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{reservation.book_title}</CardTitle>
                          <p className="text-sm text-gray-600">{reservation.book_author}</p>
                          {reservation.book_isbn && (
                            <p className="text-xs text-gray-500">ISBN: {reservation.book_isbn}</p>
                          )}
                          {reservation.book_tombo && (
                            <p className="text-xs text-gray-500">📋 Tombo: {reservation.book_tombo}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(reservation.status)}
                        {reservation.status === 'waiting' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelReservation(reservation.id, reservation.book_title)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      {reservation.company_name}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Reservado em: {formatDate(reservation.reserved_at)}
                    </div>
                    
                    {reservation.status === 'waiting' && (
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-blue-800">
                          <Users className="h-4 w-4 mr-2" />
                          Posição na fila: {reservation.position_in_queue}
                        </div>
                        {queue && (
                          <div className="text-xs text-blue-600">
                            Total: {queue.total_waiting} pessoas
                          </div>
                        )}
                      </div>
                    )}
                    
                    {reservation.status === 'ready' && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-800 font-medium">
                          🎉 Livro disponível para retirada!
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Notificado em: {reservation.notified_at ? formatDate(reservation.notified_at) : 'Agora'}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      {historyReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          <div className="grid gap-4">
            {historyReservations.slice(0, 5).map((reservation) => (
              <Card key={reservation.id} className="opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{reservation.book_title}</h3>
                      <p className="text-sm text-gray-600">{reservation.book_author}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(reservation.reserved_at)}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {reservations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Você não tem reservas</p>
          <p className="text-sm text-gray-500">
            Vá para a biblioteca e reserve livros indisponíveis
          </p>
        </div>
      )}
    </div>
  )
}