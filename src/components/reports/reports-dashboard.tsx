'use client'

import { useState, useEffect } from 'react'
import { BarChart3, PieChart, Download, Calendar, BookOpen, Users, TrendingUp, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/simple-select'
import { useReports } from '@/hooks/use-reports'
import { useToast } from '@/hooks/use-toast'
import { SimpleBarChart } from '@/components/charts/simple-bar-chart'
import { SimplePieChart } from '@/components/charts/simple-pie-chart'
import { SimpleLineChart } from '@/components/charts/simple-line-chart'
import { SimpleAlerts } from '@/components/reports/simple-alerts'
import { DetailsModal } from '@/components/reports/details-modal'
import { BooksDetailsModal } from '@/components/reports/books-details-modal'

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [periodFilter, setPeriodFilter] = useState('last-6-months')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'reservations' | 'overdue' | 'noshow' | 'active-users'>('reservations')
  const [modalData, setModalData] = useState<any[]>([])
  const [loadingModal, setLoadingModal] = useState(false)
  
  // Estados para métricas de livros
  const [neverBorrowedCount, setNeverBorrowedCount] = useState<number>(0)
  const [highDemandCount, setHighDemandCount] = useState<number>(0)
  const [circulationRate, setCirculationRate] = useState<number>(0)
  const [mostRenewedCount, setMostRenewedCount] = useState<number>(0)
  const [booksMetricsLoaded, setBooksMetricsLoaded] = useState(false)
  
  // Estados para modal de livros
  const [booksModalOpen, setBooksModalOpen] = useState(false)
  const [booksModalType, setBooksModalType] = useState<'never-borrowed' | 'high-demand' | 'circulation-rate' | 'most-renewed'>('never-borrowed')
  const [booksModalData, setBooksModalData] = useState<any[]>([])
  
  const { toast } = useToast()
  
  const { 
    stats, 
    topBooks, 
    categories, 
    monthlyData, 
    activeUsers, 
    isLoading, 
    generateReport,
    fetchReservationsDetails,
    fetchOverdueDetails,
    fetchNoShowDetails,
    fetchNeverBorrowedBooks,
    fetchHighDemandBooks,
    fetchCirculationRate,
    fetchMostRenewedBooks
  } = useReports(periodFilter)

  const handleGenerateReport = async (type: string) => {
    const result = await generateReport(type)
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

  const handleOpenModal = async (type: 'reservations' | 'overdue' | 'noshow' | 'active-users') => {
    setModalType(type)
    setModalOpen(true)
    setLoadingModal(true)
    
    try {
      let data = []
      switch (type) {
        case 'reservations':
          data = await fetchReservationsDetails()
          break
        case 'overdue':
          data = await fetchOverdueDetails()
          break
        case 'noshow':
          data = await fetchNoShowDetails()
          break
        case 'active-users':
          data = activeUsers || []
          break
      }
      setModalData(data)
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Carregar métricas de livros quando a guia for aberta
  useEffect(() => {
    if (activeTab === 'books' && !booksMetricsLoaded) {
      const loadBooksMetrics = async () => {
        try {
          console.log('🔍 [Debug] Iniciando carregamento de métricas de livros...')
          
          const [neverBorrowed, highDemand, circulation, mostRenewed] = await Promise.all([
            fetchNeverBorrowedBooks(50),
            fetchHighDemandBooks(20),
            fetchCirculationRate(),
            fetchMostRenewedBooks(20)
          ])
          
          console.log('🔍 [Debug] Dados recebidos:')
          console.log('  - Nunca emprestados:', neverBorrowed.length, neverBorrowed)
          console.log('  - Alta demanda:', highDemand.length, highDemand)
          console.log('  - Taxa circulação:', circulation)
          console.log('  - Mais renovados:', mostRenewed.length, mostRenewed)
          
          setNeverBorrowedCount(neverBorrowed.length)
          setHighDemandCount(highDemand.length)
          setCirculationRate(circulation?.circulation_rate || 0)
          setMostRenewedCount(mostRenewed.length)
          setBooksMetricsLoaded(true)
          
          console.log('✅ [Debug] Métricas carregadas com sucesso!')
        } catch (error) {
          console.error('❌ [Debug] Erro ao carregar métricas de livros:', error)
        }
      }
      
      loadBooksMetrics()
    }
  }, [activeTab, booksMetricsLoaded, fetchNeverBorrowedBooks, fetchHighDemandBooks, fetchCirculationRate, fetchMostRenewedBooks])

  const getModalTitle = () => {
    switch (modalType) {
      case 'reservations':
        return 'Reservas Ativas'
      case 'overdue':
        return 'Empréstimos em Atraso'
      case 'noshow':
        return 'Reservas Não Retiradas (No-Show)'
      case 'active-users':
        return 'Usuários Mais Ativos'
      default:
        return 'Detalhes'
    }
  }

  const getModalDescription = () => {
    switch (modalType) {
      case 'reservations':
        return 'Lista de usuários com reservas ativas aguardando retirada'
      case 'overdue':
        return 'Lista de usuários com empréstimos vencidos'
      case 'noshow':
        return 'Lista de usuários que não retiraram suas reservas no prazo'
      case 'active-users':
        return 'Lista dos usuários mais ativos no período selecionado'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada do uso da biblioteca
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Último mês</SelectItem>
              <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
              <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
              <SelectItem value="last-year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleGenerateReport('completo')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Livros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBooks?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Empréstimos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalLoans?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeUsers || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média Mensal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageLoansPerMonth || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleOpenModal('reservations')}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalReservations || '0'}
                </p>
                <p className="text-xs text-indigo-600 mt-1">Clique para ver detalhes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleOpenModal('overdue')}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.overdueLoans || '0'}
                </p>
                <p className="text-xs text-red-600 mt-1">Clique para ver detalhes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleOpenModal('noshow')}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No-Show</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats?.noShowReservations || '0'}
                </p>
                <p className="text-xs text-amber-600 mt-1">Clique para ver detalhes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="books">Livros</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Empréstimos por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData && monthlyData.length > 0 ? (
                  <SimpleBarChart
                    data={monthlyData.map(item => ({
                      name: item.month,
                      value: item.loans
                    }))}
                    dataKey="value"
                    color="#3b82f6"
                    height={250}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Carregando dados...</p>
                    </div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  {monthlyData?.slice(-3).map((item) => (
                    <div key={item.month} className="text-center">
                      <p className="font-medium">{item.loans}</p>
                      <p className="text-gray-500">{item.month}</p>
                    </div>
                  )) || (
                    <div className="col-span-3 text-center text-gray-500">
                      Carregando dados...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categorias Mais Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories?.map((category, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
                    return (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                          <span className="text-sm font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{category.count}</span>
                          <span className="text-xs text-gray-500">({category.percentage}%)</span>
                        </div>
                      </div>
                    )
                  }) || (
                    <div className="text-center text-gray-500">
                      Carregando categorias...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Livros Mais Emprestados */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Livros</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateReport('livros-populares')}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topBooks?.slice(0, 6).map((book, index) => (
                    <div key={book.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{book.title}</p>
                          <p className="text-xs text-gray-500 truncate">{book.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{book.loans}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      Carregando...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras dos Top Livros */}
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos por Livro</CardTitle>
              </CardHeader>
              <CardContent>
                {topBooks && topBooks.length > 0 ? (
                  <SimpleBarChart
                    data={topBooks.slice(0, 6).map(book => ({
                      name: book.title.length > 10 ? book.title.substring(0, 10) + '...' : book.title,
                      value: book.loans
                    }))}
                    dataKey="value"
                    color="#10b981"
                    height={250}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Carregando...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {categories && categories.length > 0 ? (
                  <SimplePieChart
                    data={categories.slice(0, 5).map((cat, index) => ({
                      name: cat.category,
                      value: cat.count,
                      color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
                    }))}
                    height={250}
                  />
                ) : (
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cards de Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={async () => {
              const data = await fetchNeverBorrowedBooks(50)
              setBooksModalType('never-borrowed')
              setBooksModalData(data)
              setBooksModalOpen(true)
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nunca Emprestados</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {booksMetricsLoaded ? neverBorrowedCount : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clique para ver resumo</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={async () => {
              const data = await fetchHighDemandBooks(20)
              setBooksModalType('high-demand')
              setBooksModalData(data)
              setBooksModalOpen(true)
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alta Demanda</p>
                    <p className="text-2xl font-bold text-red-600">
                      {booksMetricsLoaded ? highDemandCount : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clique para ver resumo</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={async () => {
              const data = await fetchCirculationRate()
              if (data) {
                setBooksModalType('circulation-rate')
                setBooksModalData([data])
                setBooksModalOpen(true)
              }
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Circulação</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {booksMetricsLoaded ? `${circulationRate}%` : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clique para ver resumo</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={async () => {
              const data = await fetchMostRenewedBooks(20)
              setBooksModalType('most-renewed')
              setBooksModalData(data)
              setBooksModalOpen(true)
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mais Renovados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {booksMetricsLoaded ? mostRenewedCount : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clique para ver resumo</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usuários Mais Ativos</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateReport('usuarios-ativos')}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeUsers?.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <p className="text-xs text-green-600">
                            Última atividade: {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{user.totalLoans}</p>
                        <p className="text-xs text-gray-500">total</p>
                        <p className="text-xs text-blue-600">{user.activeLoans} ativos</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      Carregando usuários ativos...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData?.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{month.month}</p>
                          <p className="text-xs text-gray-500">{month.newUsers} novos usuários</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{month.loans} empréstimos</p>
                        <p className="text-xs text-blue-600">{month.returns} devoluções</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      Carregando atividade mensal...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SimpleAlerts />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Taxa de Devolução</p>
                        <p className="text-xs text-gray-500">Livros devolvidos no prazo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">94.2%</p>
                      <p className="text-xs text-gray-500">+2.1% vs mês anterior</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Engajamento</p>
                        <p className="text-xs text-gray-500">Usuários ativos mensais</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">87.5%</p>
                      <p className="text-xs text-gray-500">+5.3% vs mês anterior</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Rotatividade</p>
                        <p className="text-xs text-gray-500">Empréstimos por livro/mês</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">2.7x</p>
                      <p className="text-xs text-gray-500">+0.3x vs mês anterior</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Taxa de Atraso</p>
                        <p className="text-xs text-gray-500">Empréstimos em atraso</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">5.8%</p>
                      <p className="text-xs text-gray-500">-1.2% vs mês anterior</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData?.slice(-4).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600">{month.month}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Empréstimos: {month.loans}</p>
                          <p className="text-xs text-gray-500">Devoluções: {month.returns}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {((month.returns / month.loans) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">taxa devolução</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      Carregando dados de performance...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData && monthlyData.length > 0 ? (
                  <SimpleLineChart
                    data={monthlyData.map(item => ({
                      name: item.month,
                      empréstimos: item.loans,
                      devoluções: item.returns,
                      novosUsuários: item.newUsers
                    }))}
                    lines={[
                      { dataKey: 'empréstimos', color: '#3b82f6', name: 'Empréstimos' },
                      { dataKey: 'devoluções', color: '#10b981', name: 'Devoluções' },
                      { dataKey: 'novosUsuários', color: '#8b5cf6', name: 'Novos Usuários' }
                    ]}
                    height={300}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Carregando tendências...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências de Crescimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Crescimento de Usuários</h4>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">+15.3%</p>
                    <p className="text-sm text-gray-600">Novos usuários este mês</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Aumento de Empréstimos</h4>
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">+8.7%</p>
                    <p className="text-sm text-gray-600">Comparado ao mês anterior</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Diversidade de Categorias</h4>
                      <PieChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">+12.1%</p>
                    <p className="text-sm text-gray-600">Novas categorias exploradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsões e Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-900 mb-2">📈 Tendência Positiva</h4>
                    <p className="text-sm text-blue-800">
                      O crescimento de empréstimos na categoria &quot;Tecnologia&quot; indica interesse crescente em desenvolvimento profissional.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-900 mb-2">✅ Oportunidade</h4>
                    <p className="text-sm text-green-800">
                      Usuários ativos aumentaram 15%. Considere expandir o acervo nas categorias mais populares.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <h4 className="font-medium text-orange-900 mb-2">⚠️ Atenção</h4>
                    <p className="text-sm text-orange-800">
                      Taxa de atraso ainda em 5.8%. Implementar lembretes automáticos pode ajudar.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-medium text-purple-900 mb-2">🎯 Recomendação</h4>
                    <p className="text-sm text-purple-800">
                      Baseado nos padrões, prevê-se aumento de 20% nos empréstimos no próximo trimestre.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes */}
      <DetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={getModalTitle()}
        description={getModalDescription()}
        items={loadingModal ? [] : modalData}
        type={modalType}
      />
      
      {/* Modal de Detalhes de Livros */}
      <BooksDetailsModal
        isOpen={booksModalOpen}
        onClose={() => setBooksModalOpen(false)}
        type={booksModalType}
        data={booksModalData}
      />
    </div>
  )
}