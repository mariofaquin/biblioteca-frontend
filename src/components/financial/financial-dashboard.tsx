'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/simple-select'

// Dados mockados para dashboard financeiro
const mockFinancialData = {
  totalRevenue: 15420.50,
  monthlyGrowth: 12.5,
  activeSubscriptions: 45,
  pendingPayments: 3,
}

const mockSubscriptions = [
  {
    id: '1',
    customer_name: 'Empresa ABC Ltda',
    plan: 'Premium',
    amount: 299.90,
    status: 'active',
    next_payment: '2024-02-15T00:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    customer_name: 'Tech Solutions Inc',
    plan: 'Basic',
    amount: 99.90,
    status: 'active',
    next_payment: '2024-02-20T00:00:00Z',
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    customer_name: 'Startup XYZ',
    plan: 'Premium',
    amount: 299.90,
    status: 'pending',
    next_payment: '2024-01-25T00:00:00Z',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '4',
    customer_name: 'Consultoria 123',
    plan: 'Enterprise',
    amount: 599.90,
    status: 'active',
    next_payment: '2024-02-10T00:00:00Z',
    created_at: '2024-01-05T00:00:00Z',
  },
]

const mockTransactions = [
  {
    id: '1',
    customer_name: 'Empresa ABC Ltda',
    amount: 299.90,
    status: 'paid',
    payment_date: '2024-01-15T10:30:00Z',
    description: 'Assinatura Premium - Janeiro 2024',
  },
  {
    id: '2',
    customer_name: 'Tech Solutions Inc',
    amount: 99.90,
    status: 'paid',
    payment_date: '2024-01-20T14:15:00Z',
    description: 'Assinatura Basic - Janeiro 2024',
  },
  {
    id: '3',
    customer_name: 'Startup XYZ',
    amount: 299.90,
    status: 'pending',
    payment_date: null,
    description: 'Assinatura Premium - Janeiro 2024',
  },
]

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ativo
          </span>
        )
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendente
          </span>
        )
      case 'paid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Pago
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelado
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: 'bg-blue-100 text-blue-800',
      Premium: 'bg-purple-100 text-purple-800',
      Enterprise: 'bg-orange-100 text-orange-800',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan as keyof typeof colors]}`}>
        {plan}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const filteredSubscriptions = mockSubscriptions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter
    return matchesStatus && matchesPlan
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe receitas, assinaturas e pagamentos
          </p>
        </div>
        <Button>
          <DollarSign className="h-4 w-4 mr-2" />
          Configurar Asaas
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(mockFinancialData.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crescimento Mensal</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{mockFinancialData.monthlyGrowth}%
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
                <p className="text-sm font-medium text-gray-600">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockFinancialData.activeSubscriptions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockFinancialData.pendingPayments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Faturamento */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento dos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico de faturamento</p>
              <p className="text-sm text-gray-500">Integração com Chart.js será implementada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assinaturas</CardTitle>
                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Planos</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próximo Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.customer_name}
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(subscription.plan)}
                      </TableCell>
                      <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>{formatDate(subscription.next_payment)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                          {subscription.status === 'pending' && (
                            <Button size="sm">
                              Cobrar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.customer_name}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        {transaction.payment_date 
                          ? formatDate(transaction.payment_date)
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Basic</span>
                    <span className="font-medium">
                      {mockSubscriptions.filter(s => s.plan === 'Basic').length} assinaturas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium</span>
                    <span className="font-medium">
                      {mockSubscriptions.filter(s => s.plan === 'Premium').length} assinaturas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Enterprise</span>
                    <span className="font-medium">
                      {mockSubscriptions.filter(s => s.plan === 'Enterprise').length} assinaturas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSubscriptions
                    .filter(s => s.status === 'active')
                    .slice(0, 3)
                    .map((subscription) => (
                      <div key={subscription.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{subscription.customer_name}</p>
                          <p className="text-xs text-gray-500">{subscription.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(subscription.amount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(subscription.next_payment)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}