'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao sistema de biblioteca multiempresa
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerenciar usuários do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sistema de gestão de usuários implementado
            </p>
            <a href="/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Acessar →
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Livros</CardTitle>
            <CardDescription>Catálogo de livros da biblioteca</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sistema de gestão de livros implementado
            </p>
            <a href="/books" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Acessar →
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Empréstimos</CardTitle>
            <CardDescription>Controle de empréstimos e reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sistema de empréstimos e reservas implementado
            </p>
            <a href="/loans" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Acessar →
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>Dashboard financeiro e assinaturas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Integração Asaas e controle financeiro
            </p>
            <a href="/financial" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Acessar →
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
            <CardDescription>Analytics e relatórios detalhados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Análises e estatísticas de uso
            </p>
            <a href="/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Acessar →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}