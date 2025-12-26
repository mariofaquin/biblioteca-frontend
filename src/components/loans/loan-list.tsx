'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle, XCircle, RotateCcw, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import { Pagination } from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  useLoans, 
  useRenewLoan, 
  useReturnLoan
} from '@/hooks/use-loans'
import { useReservations } from '@/hooks/use-reservations'
import { useQueryClient } from '@tanstack/react-query'
import { ReservationNotification } from '@/components/ui/reservation-notification'

export function LoanList() {
  const [activeTab, setActiveTab] = useState('loans')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()
  
  // Verificar se o usuário é admin ou root para mostrar coluna de usuário
  const [isAdminOrRoot, setIsAdminOrRoot] = useState(false)
  
  useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const isRoot = currentUser.is_root === true || currentUser.is_root === 'true'
      const isAdmin = currentUser.email && (
        currentUser.email.includes('admin') || 
        currentUser.email.includes('root@')
      )
      setIsAdminOrRoot(isRoot || isAdmin)
    } catch (error) {
      console.log('Erro ao verificar permissões do usuário')
    }
  })
  
  // Hooks para dados
  const { data: loansData, isLoading: loansLoading } = useLoans({
    page: currentPage,
    per_page: 20,
  })
  const loans = Array.isArray(loansData?.data) ? loansData.data : []
  
  const { reservations: reservationsData, isLoading: reservationsLoading, cancelReservation } = useReservations()
  const reservations = Array.isArray(reservationsData) ? reservationsData : []
  
  // Hooks para ações
  const renewLoanMutation = useRenewLoan()
  const returnLoanMutation = useReturnLoan()
  
  // Estado para notificação de reserva
  const [notificationData, setNotificationData] = useState<any>(null)
  
  // Listener para evento de reserva disponível
  useEffect(() => {
    const handleReservationReady = (event: any) => {
      console.log('🔔 Evento reservationReady recebido:', event.detail)
      
      // Mostrar notificação customizada
      setNotificationData(event.detail)
      
      // Atualizar dados das reservas
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    }
    
    window.addEventListener('reservationReady', handleReservationReady)
    
    // Solicitar permissão para notificações do navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => {
      window.removeEventListener('reservationReady', handleReservationReady)
    }
  }, [queryClient])
  
  // Função para efetivar empréstimo da reserva
  const handleConfirmReservation = async () => {
    if (!notificationData?.reservation) return
    
    try {
      // Aqui você pode implementar a lógica de criar o empréstimo
      // Por enquanto, vamos apenas mudar para a aba de reservas
      setActiveTab('reservations')
      setNotificationData(null)
      
      // Atualizar reservas
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    } catch (error) {
      console.error('Erro ao efetivar empréstimo:', error)
    }
  }

  const getStatusBadge = (status: string, daysOverdue: number = 0) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Ativo
          </span>
        )
      case 'returned':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Devolvido
          </span>
        )
      case 'overdue':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Atrasado ({daysOverdue} dias)
          </span>
        )
      case 'expired':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Expirado
          </span>
        )
      default:
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Aguardando
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerencie seus empréstimos e reservas de livros
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empréstimos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loans.filter(loan => loan.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loans.filter(loan => loan.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(res => res.status === 'waiting' || res.status === 'ready').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Devolvidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loans.filter(loan => loan.status === 'returned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="loans">Empréstimos</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Empréstimos</CardTitle>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Livro</TableHead>
                      <TableHead>Autor</TableHead>
                      {isAdminOrRoot && <TableHead>Usuário</TableHead>}
                      <TableHead>Data Empréstimo</TableHead>
                      <TableHead>Data Vencimento</TableHead>
                      <TableHead>Renovações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          <div>{loan.book_title}</div>
                          {loan.book_tombo && (
                            <div className="text-xs text-gray-500 mt-1">📋 Tombo: {loan.book_tombo}</div>
                          )}
                        </TableCell>
                        <TableCell>{loan.book_author}</TableCell>
                        {isAdminOrRoot && (
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{loan.user_name || 'N/A'}</div>
                              <div className="text-gray-500">{loan.user_email || ''}</div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{formatDate(loan.borrowed_at)}</TableCell>
                        <TableCell>{formatDate(loan.due_date)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {loan.renewal_count}/{loan.max_renewals}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(loan.status, loan.days_overdue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {(loan.status === 'active' || loan.status === 'overdue') && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => returnLoanMutation.mutate(loan.id)}
                                disabled={returnLoanMutation.isPending}
                              >
                                <Package className="h-3 w-3 mr-1" />
                                Devolver
                              </Button>
                            )}
                            {loan.status === 'active' && loan.can_renew && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  console.log('🖱️ Clique no botão renovar:', { loanId: loan.id, bookId: loan.book_id });
                                  renewLoanMutation.mutate({ 
                                    loanId: loan.id, 
                                    bookId: loan.book_id 
                                  });
                                }}
                                disabled={renewLoanMutation.isPending}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                {renewLoanMutation.isPending ? 'Renovando...' : 'Renovar'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {!loansLoading && loans.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum empréstimo encontrado</p>
                  <p className="text-sm text-gray-500">Você ainda não fez nenhum empréstimo</p>
                </div>
              )}

              {/* Paginação */}
              {loansData && loansData.pagination && loansData.pagination.total > 0 && (
                <Pagination
                  currentPage={loansData.pagination.page}
                  lastPage={loansData.pagination.total_pages}
                  total={loansData.pagination.total}
                  perPage={loansData.pagination.per_page}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Minhas Reservas</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Reservas Ativas */}
                  {reservations.filter(r => r.status === 'waiting' || r.status === 'ready').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Reservas Ativas</h3>
                      <div className="space-y-3">
                        {reservations
                          .filter(r => r.status === 'waiting' || r.status === 'ready')
                          .map((reservation) => (
                            <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                    <h4 className="font-medium">{reservation.book_title}</h4>
                                    <p className="text-sm text-gray-600">{reservation.book_author}</p>
                                    {reservation.book_isbn && (
                                      <p className="text-xs text-gray-500">ISBN: {reservation.book_isbn}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      Reservado em: {formatDateTime(reservation.reserved_at)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {reservation.status === 'waiting' ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⏳ Aguardando
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white animate-pulse shadow-lg">
                                      ✅ DISPONÍVEL!
                                    </span>
                                  )}
                                  {reservation.status === 'ready' ? (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                      onClick={() => {
                                        alert('🎉 Vá até a biblioteca para retirar seu livro!\n\nLembre-se de levar um documento de identificação.')
                                      }}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Retirar Livro
                                    </Button>
                                  ) : null}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => cancelReservation(reservation.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                              
                              {reservation.status === 'waiting' && (
                                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                                  <div className="flex items-center justify-between text-sm text-blue-800">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2" />
                                      Posição na fila: {reservation.position_in_queue}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      Empresa: {reservation.company_name}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {reservation.status === 'ready' && (
                                <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 p-4 rounded-lg shadow-md">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div className="text-base text-green-900 font-bold">
                                      🎉 SEU LIVRO ESTÁ DISPONÍVEL!
                                    </div>
                                  </div>
                                  <div className="text-sm text-green-800 mb-2">
                                    O livro foi devolvido e está reservado para você. Vá até a biblioteca para retirá-lo!
                                  </div>
                                  {reservation.notified_at && (
                                    <div className="text-xs text-green-600">
                                      📅 Disponível desde: {formatDateTime(reservation.notified_at)}
                                    </div>
                                  )}
                                  <div className="mt-3 pt-3 border-t border-green-200">
                                    <div className="text-xs text-green-700 font-medium">
                                      ⚠️ Importante: Retire o livro em até 48 horas ou a reserva será cancelada
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Histórico */}
                  {reservations.filter(r => r.status === 'cancelled' || r.status === 'fulfilled').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Histórico</h3>
                      <div className="space-y-2">
                        {reservations
                          .filter(r => r.status === 'cancelled' || r.status === 'fulfilled')
                          .slice(0, 3)
                          .map((reservation) => (
                            <div key={reservation.id} className="border rounded-lg p-3 opacity-75">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-sm">{reservation.book_title}</h4>
                                  <p className="text-xs text-gray-600">{reservation.book_author}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatDateTime(reservation.reserved_at)}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  reservation.status === 'cancelled' 
                                    ? 'bg-gray-100 text-gray-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {reservation.status === 'cancelled' ? 'Cancelada' : 'Emprestado'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!reservationsLoading && reservations.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma reserva encontrada</p>
                  <p className="text-sm text-gray-500">
                    Vá para a biblioteca e reserve livros indisponíveis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Notificação de reserva disponível */}
      {notificationData && (
        <ReservationNotification
          bookTitle={notificationData.reservation.book_title}
          bookAuthor={notificationData.reservation.book_author}
          bookCoverImage={notificationData.reservation.book_cover_image}
          reservationId={notificationData.reservation.id}
          onClose={() => setNotificationData(null)}
          onConfirm={handleConfirmReservation}
        />
      )}
    </div>
  )
}