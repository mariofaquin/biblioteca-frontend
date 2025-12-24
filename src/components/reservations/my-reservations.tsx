'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ReservationStatusBadge } from '@/components/ui/reservation-status-badge'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { BookOpen, X, CheckCircle } from 'lucide-react'

interface Reservation {
  id: string
  book_id: string
  book_title: string
  book_author?: string
  book_tombo?: string
  book_cover_image?: string
  status: string
  available_since?: string | null
  expires_at?: string | null
  cancellation_reason?: string | null
  created_at: string
}

interface MyReservationsProps {
  reservations: Reservation[]
  onPickup: (reservationId: string) => void
  onCancel: (reservationId: string) => void
}

export function MyReservations({ 
  reservations, 
  onPickup, 
  onCancel 
}: MyReservationsProps) {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Você não possui reservas no momento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{reservation.book_title}</CardTitle>
                {reservation.book_author && (
                  <p className="text-sm text-gray-600 mt-1">
                    por {reservation.book_author}
                  </p>
                )}
                {reservation.book_tombo && (
                  <p className="text-xs text-gray-500 mt-1">
                    📋 Tombo: {reservation.book_tombo}
                  </p>
                )}
              </div>
              <ReservationStatusBadge 
                status={reservation.status}
                expiresAt={reservation.expires_at}
                availableSince={reservation.available_since}
              />
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Capa do livro */}
              {reservation.book_cover_image && (
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={reservation.book_cover_image} 
                      alt={reservation.book_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Conteúdo */}
              <div className="flex-1 space-y-4">
                {/* Contador para reservas disponíveis */}
                {(reservation.status === 'available' || reservation.status === 'ready') && reservation.expires_at && (
                  <CountdownTimer expiresAt={reservation.expires_at} />
                )}
                
                {/* Alerta para reservas canceladas */}
                {reservation.status === 'cancelled_timeout' && reservation.cancellation_reason && (
                  <Alert variant="destructive">
                    <AlertTitle>Reserva Cancelada</AlertTitle>
                    <AlertDescription>
                      {reservation.cancellation_reason}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Botões de ação */}
                <div className="flex gap-2">
                  {(reservation.status === 'available' || reservation.status === 'ready') && (
                    <>
                      <Button 
                        onClick={() => onPickup(reservation.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Retirar Livro
                      </Button>
                      <Button 
                        onClick={() => onCancel(reservation.id)}
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  {(reservation.status === 'pending' || reservation.status === 'waiting') && (
                    <Button 
                      onClick={() => onCancel(reservation.id)}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Reserva
                    </Button>
                  )}
                  
                  {reservation.status === 'cancelled_timeout' && (
                    <Button 
                      onClick={() => onCancel(reservation.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Remover da Lista
                    </Button>
                  )}
                </div>
                
                {/* Informações adicionais */}
                <div className="text-xs text-gray-500">
                  Reservado em: {new Date(reservation.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
