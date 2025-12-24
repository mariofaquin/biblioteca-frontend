'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/use-permissions'

interface LibraryStats {
  totalBooks: number
  totalLoans: number
  activeUsers: number
  averageLoansPerMonth: number
  totalReservations: number
  overdueLoans: number
  noShowReservations: number
}

interface TopBook {
  id: string
  title: string
  author: string
  loans: number
  category: string
}

interface CategoryStats {
  category: string
  count: number
  percentage: number
}

interface MonthlyData {
  month: string
  loans: number
  returns: number
  newUsers: number
}

interface UserActivity {
  id: string
  name: string
  email: string
  totalLoans: number
  activeLoans: number
  lastActivity: string
}

interface NeverBorrowedBook {
  id: string
  title: string
  author: string
  category: string
  created_at: string
  days_in_stock: number
}

interface HighDemandBook {
  id: string
  title: string
  author: string
  category: string
  reservations_count: number
  active_loans: number
}

interface CirculationRate {
  total_books: number
  borrowed_books: number
  available_books: number
  circulation_rate: number
  period: string
}

interface MostRenewedBook {
  id: string
  title: string
  author: string
  category: string
  renewals_count: number
  avg_loan_duration: number
}

export function useReports(period: string = 'last-6-months') {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [topBooks, setTopBooks] = useState<TopBook[] | null>(null)
  const [categories, setCategories] = useState<CategoryStats[] | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[] | null>(null)
  const [activeUsers, setActiveUsers] = useState<UserActivity[] | null>(null)
  const { user, selectedCompany, isUser, isAdmin, isRoot } = usePermissions()

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        
        // Buscar estatísticas gerais
        console.log('📊 [Reports] Buscando estatísticas reais da API')
        const statsResponse = await api.get(`/reports/stats?period=${period}`)
        console.log('✅ [Reports] Dados recebidos:', statsResponse.data)
        setStats(statsResponse.data)

        // Buscar livros mais emprestados
        console.log('📚 [Reports] Buscando livros populares da API')
        const booksResponse = await api.get(`/reports/top-books?period=${period}`)
        console.log('✅ [Reports] Livros recebidos:', booksResponse.data)
        setTopBooks(booksResponse.data)

        // Buscar estatísticas por categoria
        console.log('📊 [Reports] Buscando categorias da API')
        const categoriesResponse = await api.get(`/reports/categories?period=${period}`)
        console.log('✅ [Reports] Categorias recebidas:', categoriesResponse.data)
        setCategories(categoriesResponse.data)

        // Buscar dados mensais
        console.log('📈 [Reports] Buscando dados mensais da API')
        const monthlyResponse = await api.get(`/reports/monthly?period=${period}`)
        console.log('✅ [Reports] Dados mensais recebidos:', monthlyResponse.data)
        setMonthlyData(monthlyResponse.data)

        // Buscar usuários mais ativos
        console.log('👥 [Reports] Buscando usuários ativos da API')
        const usersResponse = await api.get(`/reports/active-users?period=${period}`)
        console.log('✅ [Reports] Usuários recebidos:', usersResponse.data)
        setActiveUsers(usersResponse.data)

      } catch (error) {
        console.error('❌ [Reports] Erro ao buscar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [period, selectedCompany?.id, user?.role])

  const generateReport = async (type: string) => {
    try {
      console.log(`📄 [Reports] Gerando relatório: ${type}`)
      
      // Simular geração de relatório
      const reportData = {
        type,
        period,
        generatedAt: new Date().toISOString(),
        stats,
        topBooks,
        categories,
        monthlyData,
        activeUsers
      }
      
      // Em produção, isso faria uma chamada para a API
      // const response = await api.post('/reports/generate', reportData)
      
      // Por enquanto, simular download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${type}-${period}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return { success: true, message: 'Relatório gerado com sucesso!' }
    } catch (error) {
      console.error('❌ [Reports] Erro ao gerar relatório:', error)
      return { success: false, message: 'Erro ao gerar relatório' }
    }
  }

  const fetchReservationsDetails = async () => {
    try {
      const response = await api.get('/reports/details/reservations')
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes de reservas:', error)
      return []
    }
  }

  const fetchOverdueDetails = async () => {
    try {
      const response = await api.get('/reports/details/overdue')
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes de atrasos:', error)
      return []
    }
  }

  const fetchNoShowDetails = async () => {
    try {
      const response = await api.get(`/reports/details/noshow?period=${period}`)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes de no-show:', error)
      return []
    }
  }

  // Novas funções para guia Livros
  const fetchNeverBorrowedBooks = async (limit: number = 50): Promise<NeverBorrowedBook[]> => {
    try {
      console.log('📚 [Reports] Buscando livros nunca emprestados')
      const response = await api.get(`/reports/books/never-borrowed?limit=${limit}`)
      console.log('✅ [Reports] Livros nunca emprestados:', response.data.length)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar livros nunca emprestados:', error)
      return []
    }
  }

  const fetchHighDemandBooks = async (limit: number = 20): Promise<HighDemandBook[]> => {
    try {
      console.log('🔥 [Reports] Buscando livros com alta demanda')
      const response = await api.get(`/reports/books/high-demand?limit=${limit}`)
      console.log('✅ [Reports] Livros com alta demanda:', response.data.length)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar livros com alta demanda:', error)
      return []
    }
  }

  const fetchCirculationRate = async (): Promise<CirculationRate | null> => {
    try {
      console.log('📊 [Reports] Buscando taxa de circulação')
      const response = await api.get(`/reports/books/circulation-rate?period=${period}`)
      console.log('✅ [Reports] Taxa de circulação:', response.data.circulation_rate + '%')
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar taxa de circulação:', error)
      return null
    }
  }

  const fetchMostRenewedBooks = async (limit: number = 20): Promise<MostRenewedBook[]> => {
    try {
      console.log('🔄 [Reports] Buscando livros mais renovados')
      const response = await api.get(`/reports/books/most-renewed?period=${period}&limit=${limit}`)
      console.log('✅ [Reports] Livros mais renovados:', response.data.length)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar livros mais renovados:', error)
      return []
    }
  }

  return {
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
    // Novas funções para guia Livros
    fetchNeverBorrowedBooks,
    fetchHighDemandBooks,
    fetchCirculationRate,
    fetchMostRenewedBooks
  }
}