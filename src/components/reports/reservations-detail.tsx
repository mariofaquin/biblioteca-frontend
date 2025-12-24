'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Download, Clock, Book, User } from 'lucide-react'
import { useDetailedReports } from '@/hooks/use-detailed-reports'
import { useToast } from '@/hooks/use-toast'

export function ReservationsDetail() {
  const { usersWithReservations, isLoading, sendReminderEmail, generateDetailedReport } = useDetailedReports()
  const { toast } = useToast()
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  const handleSendReminder = async (userId: string, userName: string) => {
    setSendingReminder(userId)
    try {
      const result = await sendReminderEmail(userId, 'reservation')
      if (result.success) {
        toast({
          title: "Lembrete enviado!",
          description: `Email enviado para ${userName}`,
        })
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } finally {
      setSendingReminder(null)
    }
  }

  const handleGenerateReport = async () => {
    const result = await generateDetailedReport('reservations')
    if (result.success) {
      toast({
        title: "Relatório gerado!",
        description: result.message,
      })
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando reservas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Usuários com Reservas Ativas</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {usersWithReservations?.length || 0}
            </Badge>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Relatório Completo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!usersWithReservations || usersWithReservations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma reserva ativa no momento</p>
            <p className="text-sm text-gray-500">Todas as reservas foram atendidas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usersWithReservations.map((reservation) => (
              <div key={`${reservation.id}-${reservation.book.id}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Informações do usuário */}
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{reservation.name}</p>
                        <p className="text-sm text-gray-500">{reservation.email}</p>
                      </div>
                    </div>

                    {/* Informações do livro */}
                    <div className="flex items-start space-x-2">
                      <Book className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reservation.book.title}</p>
                        <p className="text-xs text-gray-500">por {reservation.book.author}</p>
                        <p className="text-xs text-gray-400">ISBN: {reservation.book.isbn}</p>
                      </div>
                    </div>

                    {/* Tempo de espera */}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          Aguardando há {reservation.daysWaiting} {reservation.daysWaiting === 1 ? 'dia' : 'dias'}
                        </span>
                        <Badge 
                          variant={reservation.daysWaiting > 7 ? "destructive" : reservation.daysWaiting > 3 ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {reservation.daysWaiting > 7 ? 'Urgente' : reservation.daysWaiting > 3 ? 'Atenção' : 'Recente'}
                        </Badge>
                      </div>
                    </div>

                    {/* Data da reserva */}
                    <p className="text-xs text-gray-500">
                      Reservado em: {new Date(reservation.reservationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendReminder(reservation.id, reservation.name)}
                      disabled={sendingReminder === reservation.id}
                      className="text-xs"
                    >
                      {sendingReminder === reservation.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                      ) : (
                        <Mail className="h-3 w-3 mr-1" />
                      )}
                      Notificar
                    </Button>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs justify-center ${
                        reservation.daysWaiting > 7 
                          ? 'border-red-200 text-red-700' 
                          : reservation.daysWaiting > 3 
                          ? 'border-yellow-200 text-yellow-700' 
                          : 'border-green-200 text-green-700'
                      }`}
                    >
                      Prioridade {reservation.daysWaiting > 7 ? 'Alta' : reservation.daysWaiting > 3 ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}