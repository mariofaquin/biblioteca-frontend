'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, AlertTriangle, User, Book, Mail, Download, ChevronDown, ChevronUp, Phone, MapPin, Clock, DollarSign } from 'lucide-react'
import { useReports } from '@/hooks/use-reports'
import { useToast } from '@/hooks/use-toast'

// Dados mock removidos - agora usa dados reais
const mockReservationsOLD = [
  {
    id: '1',
    userName: 'Carla Ferreira',
    userEmail: 'carla.ferreira@email.com',
    userPhone: '(11) 99876-5432',
    userAddress: 'Rua das Flores, 123 - São Paulo/SP',
    userRegistration: '2023-03-15',
    bookTitle: 'The Pragmatic Programmer',
    bookAuthor: 'David Thomas',
    bookISBN: '9780135957059',
    bookCategory: 'Tecnologia',
    bookPages: 352,
    bookYear: 2019,
    bookDescription: 'Um guia prático para se tornar um programador mais eficaz e profissional.',
    daysWaiting: 5,
    reservationDate: '2024-10-19',
    position: 1
  },
  {
    id: '2',
    userName: 'Diego Nascimento',
    userEmail: 'diego.nascimento@email.com',
    userPhone: '(11) 98765-1234',
    userAddress: 'Av. Paulista, 456 - São Paulo/SP',
    userRegistration: '2023-07-22',
    bookTitle: 'Armas, Germes e Aço',
    bookAuthor: 'Jared Diamond',
    bookISBN: '9788501065407',
    bookCategory: 'História',
    bookPages: 476,
    bookYear: 2005,
    bookDescription: 'Uma análise fascinante sobre os destinos das sociedades humanas.',
    daysWaiting: 3,
    reservationDate: '2024-10-21',
    position: 2
  },
  {
    id: '3',
    userName: 'Patrícia Gomes',
    userEmail: 'patricia.gomes@email.com',
    userPhone: '(11) 97654-3210',
    userAddress: 'Rua Augusta, 789 - São Paulo/SP',
    userRegistration: '2024-01-10',
    bookTitle: 'O Príncipe',
    bookAuthor: 'Nicolau Maquiavel',
    bookISBN: '9788525432200',
    bookCategory: 'Filosofia',
    bookPages: 144,
    bookYear: 1532,
    bookDescription: 'Tratado clássico sobre política e poder, fundamental para entender a arte de governar.',
    daysWaiting: 2,
    reservationDate: '2024-10-22',
    position: 1
  }
]

const mockOverdue = [
  {
    id: '1',
    userName: 'Juliana Martins',
    userEmail: 'juliana.martins@email.com',
    userPhone: '(11) 98765-4321',
    userAddress: 'Rua dos Jardins, 321 - São Paulo/SP',
    userRegistration: '2022-11-08',
    bookTitle: 'The Pragmatic Programmer',
    bookAuthor: 'David Thomas',
    bookISBN: '9780135957059',
    bookCategory: 'Tecnologia',
    bookPages: 352,
    bookYear: 2019,
    bookDescription: 'Um guia prático para se tornar um programador mais eficaz e profissional.',
    daysOverdue: 6,
    fine: 3.00,
    loanDate: '2024-10-04',
    dueDate: '2024-10-18',
    renewals: 1,
    maxRenewals: 2
  },
  {
    id: '2',
    userName: 'Rafael Rodrigues',
    userEmail: 'rafael.rodrigues@email.com',
    userPhone: '(11) 91234-5678',
    userAddress: 'Alameda Santos, 654 - São Paulo/SP',
    userRegistration: '2023-05-14',
    bookTitle: 'Armas, Germes e Aço',
    bookAuthor: 'Jared Diamond',
    bookISBN: '9788501065407',
    bookCategory: 'História',
    bookPages: 476,
    bookYear: 2005,
    bookDescription: 'Uma análise fascinante sobre os destinos das sociedades humanas.',
    daysOverdue: 4,
    fine: 2.00,
    loanDate: '2024-10-06',
    dueDate: '2024-10-20',
    renewals: 0,
    maxRenewals: 2
  }
]

export function SimpleAlerts() {
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null)
  const [expandedOverdue, setExpandedOverdue] = useState<string | null>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [overdue, setOverdue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const { fetchReservationsDetails, fetchOverdueDetails } = useReports('last-6-months')
  const { toast } = useToast()
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados de alertas...')
      const [reservationsData, overdueData] = await Promise.all([
        fetchReservationsDetails(),
        fetchOverdueDetails()
      ])
      console.log('📊 Reservas recebidas:', reservationsData?.length || 0, reservationsData)
      console.log('⚠️ Atrasos recebidos:', overdueData?.length || 0, overdueData)
      setReservations(reservationsData)
      setOverdue(overdueData)
    } catch (error) {
      console.error('❌ Erro ao carregar alertas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = (userName: string, type: string) => {
    alert(`Email ${type} enviado para ${userName}!`)
  }

  const handleGenerateReport = (type: string) => {
    alert(`Relatório ${type} gerado!`)
  }

  const toggleReservationDetails = (id: string) => {
    console.log('🔄 Toggle reserva:', id, 'Estado atual:', expandedReservation)
    setExpandedReservation(expandedReservation === id ? null : id)
  }

  const toggleOverdueDetails = (id: string) => {
    console.log('🔄 Toggle atraso:', id, 'Estado atual:', expandedOverdue)
    setExpandedOverdue(expandedOverdue === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Seção de Reservas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle>Usuários com Reservas Ativas</CardTitle>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                {reservations.length}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleGenerateReport('reservas')}>
              <Download className="h-4 w-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando alertas...
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma reserva ativa no momento
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg overflow-hidden">
                {/* Card Principal - Clicável */}
                <div 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer select-none"
                  onClick={(e) => {
                    console.log('🔥 Clique na reserva:', reservation.id)
                    toggleReservationDetails(reservation.id)
                  }}
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Usuário */}
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{reservation.userName || reservation.name}</p>
                          <p className="text-sm text-gray-500">{reservation.userEmail || reservation.email}</p>
                        </div>
                      </div>

                      {/* Livro */}
                      <div className="flex items-start space-x-2">
                        <Book className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reservation.bookTitle || reservation.book_title}</p>
                          <p className="text-xs text-gray-500">por {reservation.bookAuthor || reservation.author}</p>
                        </div>
                      </div>

                      {/* Tempo de espera */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Aguardando há {reservation.daysWaiting || reservation.days_waiting} {(reservation.daysWaiting || reservation.days_waiting) === 1 ? 'dia' : 'dias'}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          (reservation.daysWaiting || reservation.days_waiting) > 7 ? 'bg-red-100 text-red-800' :
                          (reservation.daysWaiting || reservation.days_waiting) > 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(reservation.daysWaiting || reservation.days_waiting) > 7 ? 'Urgente' : (reservation.daysWaiting || reservation.days_waiting) > 3 ? 'Atenção' : 'Recente'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        Reservado em: {new Date(reservation.reservationDate || reservation.reservation_date || reservation.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {/* Ações e Indicador */}
                    <div className="flex flex-col items-end space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendEmail(reservation.userName || reservation.name, 'notificação')
                        }}
                        className="text-xs"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Notificar
                      </Button>
                      
                      {expandedReservation === reservation.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedReservation === reservation.id && (
                  <div className="border-t bg-blue-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Detalhes do Usuário */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          Informações do Usuário
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{reservation.userEmail || reservation.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium">{reservation.userPhone || reservation.phone || 'Não informado'}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                            <span className="text-gray-600">Endereço:</span>
                            <span className="font-medium">{reservation.userAddress || reservation.address || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Cadastro:</span>
                            <span className="font-medium">{new Date(reservation.userRegistration || reservation.user_created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Posição na fila:</span>
                            <span className="font-medium text-blue-600">#{reservation.position || 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes do Livro */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Book className="h-4 w-4 mr-2 text-green-600" />
                          Informações do Livro
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Título:</span>
                            <p className="font-medium">{reservation.bookTitle || reservation.book_title}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Autor:</span>
                            <p className="font-medium">{reservation.bookAuthor || reservation.author}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">ISBN:</span>
                            <span className="font-medium font-mono text-xs">{reservation.bookISBN || reservation.isbn}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Categoria:</span>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              {reservation.bookCategory || reservation.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-gray-600">Páginas:</span>
                              <span className="font-medium ml-1">{reservation.bookPages || reservation.pages || reservation.number_of_pages || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ano:</span>
                              <span className="font-medium ml-1">{reservation.bookYear || reservation.year || '-'}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Descrição:</span>
                            <p className="text-gray-700 mt-1 text-xs leading-relaxed">{reservation.bookDescription || reservation.description || reservation.notes || 'Sem descrição'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Atrasos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle>Usuários com Empréstimos em Atraso</CardTitle>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                {overdue.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total em multas:</p>
                <p className="font-bold text-red-600">
                  R$ {overdue.reduce((total, item) => total + (item.fine || (item.days_overdue * 2.50) || 0), 0).toFixed(2)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleGenerateReport('cobrança')}>
                <Download className="h-4 w-4 mr-2" />
                Relatório de Cobrança
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando alertas...
            </div>
          ) : overdue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum empréstimo em atraso no momento 🎉
            </div>
          ) : (
            <div className="space-y-4">
              {overdue.map((overdueItem) => (
              <div key={overdueItem.id} className="border border-red-200 rounded-lg bg-red-50 overflow-hidden">
                {/* Card Principal - Clicável */}
                <div 
                  className="p-4 hover:bg-red-100 transition-colors cursor-pointer select-none"
                  onClick={(e) => {
                    console.log('🔥 Clique no atraso:', overdueItem.id)
                    toggleOverdueDetails(overdueItem.id)
                  }}
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Usuário */}
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{overdueItem.userName || overdueItem.name}</p>
                          <p className="text-sm text-gray-600">{overdueItem.userEmail || overdueItem.email}</p>
                          {(overdueItem.userPhone || overdueItem.phone) && (
                            <p className="text-xs text-gray-500">{overdueItem.userPhone || overdueItem.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Livro */}
                      <div className="flex items-start space-x-2">
                        <Book className="h-4 w-4 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{overdueItem.bookTitle || overdueItem.book_title}</p>
                          <p className="text-xs text-gray-600">por {overdueItem.bookAuthor || overdueItem.author}</p>
                        </div>
                      </div>

                      {/* Datas */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-600">Empréstimo:</p>
                          <p className="font-medium">{new Date(overdueItem.loanDate || overdueItem.loan_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vencimento:</p>
                          <p className="font-medium text-red-600">{new Date(overdueItem.dueDate || overdueItem.due_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Atraso e multa */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">
                          {overdueItem.daysOverdue || overdueItem.days_overdue} {(overdueItem.daysOverdue || overdueItem.days_overdue) === 1 ? 'dia' : 'dias'} em atraso
                        </span>
                        <span className="text-sm font-medium text-green-700">
                          Multa: R$ {(overdueItem.fine || (overdueItem.days_overdue * 2.50) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Ações e Indicador */}
                    <div className="flex flex-col items-end space-y-2">
                      <Button
                        size="sm"
                        className="text-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendEmail(overdueItem.userName, 'cobrança')
                        }}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Cobrar
                      </Button>
                      
                      {expandedOverdue === overdueItem.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedOverdue === overdueItem.id && (
                  <div className="border-t bg-red-100 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Detalhes do Usuário */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="h-4 w-4 mr-2 text-red-600" />
                          Informações do Usuário
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{overdueItem.userEmail || overdueItem.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium">{overdueItem.userPhone || overdueItem.phone || 'Não informado'}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                            <span className="text-gray-600">Endereço:</span>
                            <span className="font-medium">{overdueItem.userAddress || overdueItem.address || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Cadastro:</span>
                            <span className="font-medium">{new Date(overdueItem.userRegistration || overdueItem.user_created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Renovações:</span>
                            <span className="font-medium text-orange-600">{overdueItem.renewals || 0}/{overdueItem.maxRenewals || 2}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes do Livro e Empréstimo */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Book className="h-4 w-4 mr-2 text-green-600" />
                          Informações do Empréstimo
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Livro:</span>
                            <p className="font-medium">{overdueItem.bookTitle || overdueItem.book_title}</p>
                            <p className="text-gray-600 text-xs">por {overdueItem.bookAuthor || overdueItem.author}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">ISBN:</span>
                            <span className="font-medium font-mono text-xs">{overdueItem.bookISBN || overdueItem.isbn}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Categoria:</span>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              {overdueItem.bookCategory || overdueItem.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                            <div>
                              <p className="text-gray-600 text-xs">Data do Empréstimo</p>
                              <p className="font-medium">{new Date(overdueItem.loanDate || overdueItem.loan_date).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Data de Vencimento</p>
                              <p className="font-medium text-red-600">{new Date(overdueItem.dueDate || overdueItem.due_date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-200 rounded">
                            <div>
                              <p className="text-red-800 font-medium">Dias em Atraso</p>
                              <p className="text-red-900 font-bold text-lg">{overdueItem.daysOverdue || overdueItem.days_overdue}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-800 font-medium">Multa Acumulada</p>
                              <p className="text-green-900 font-bold text-lg">R$ {(overdueItem.fine || (overdueItem.days_overdue * 2.50) || 0).toFixed(2)}</p>
                              <p className="text-xs text-gray-600">R$ 2,50/dia</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
