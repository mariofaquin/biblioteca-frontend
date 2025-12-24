'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { ReservationStatusBadge } from '@/components/ui/reservation-status-badge'

interface ReservationNotificationProps {
  bookTitle: string
  bookAuthor?: string
  bookCoverImage?: string
  reservationId: string
  status?: string
  expiresAt?: string | null
  availableSince?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function ReservationNotification({
  bookTitle,
  bookAuthor,
  bookCoverImage,
  reservationId,
  status = 'available',
  expiresAt,
  availableSince,
  onClose,
  onConfirm
}: ReservationNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleConfirm = () => {
    setIsVisible(false)
    setTimeout(onConfirm, 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Notification Card */}
      <div 
        className={`relative bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  🎉 Livro Disponível!
                </h3>
                <p className="text-green-100 text-sm">
                  Sua reserva está pronta
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-green-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex space-x-4">
            {/* Capa do livro */}
            <div className="flex-shrink-0">
              <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                {bookCoverImage ? (
                  <img 
                    src={bookCoverImage} 
                    alt={bookTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Informações do livro */}
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-1">
                {bookTitle}
              </h4>
              {bookAuthor && (
                <p className="text-sm text-gray-600 mb-3">
                  por {bookAuthor}
                </p>
              )}
              <div className="mb-3">
                <ReservationStatusBadge 
                  status={status}
                  expiresAt={expiresAt}
                  availableSince={availableSince}
                />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Ótima notícia!</strong> O livro que você reservou está disponível para retirada.
                </p>
                {expiresAt && (
                  <p className="text-xs text-green-700 mt-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    <strong>Importante:</strong> Retire em até 48 horas ou a reserva será cancelada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contador Regressivo */}
          {expiresAt && (status === 'available' || status === 'ready') && (
            <div className="mb-4">
              <CountdownTimer expiresAt={expiresAt} />
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Efetivar Empréstimo
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="px-6 py-3"
            >
              Ver Depois
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ <strong>Atenção:</strong> Você tem 48 horas para retirar o livro. Após esse prazo, sua reserva será automaticamente cancelada e o próximo da fila será notificado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
