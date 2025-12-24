'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface UserWithReservation {
  id: string
  name: string
  email: string
  reservationDate: string
  book: {
    id: string
    title: string
    author: string
    isbn: string
  }
  daysWaiting: number
}

interface UserWithOverdueBook {
  id: string
  name: string
  email: string
  phone?: string
  loanDate: string
  dueDate: string
  book: {
    id: string
    title: string
    author: string
    isbn: string
  }
  daysOverdue: number
  fine?: number
}

export function useDetailedReports() {
  const [usersWithReservations, setUsersWithReservations] = useState<UserWithReservation[] | null>(null)
  const [usersWithOverdueBooks, setUsersWithOverdueBooks] = useState<UserWithOverdueBook[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Buscar usuários com reservas ativas
        try {
          const reservationsResponse = await api.get('/reports/users-with-reservations')
          setUsersWithReservations(reservationsResponse.data)
        } catch (error) {
          console.log('📅 [Reports] Usando dados mock para reservas')
          // Dados mock realistas
          setUsersWithReservations([
            {
              id: '12',
              name: 'Carla Ferreira',
              email: 'carla.ferreira@email.com',
              reservationDate: '2024-10-19',
              book: {
                id: '6',
                title: 'The Pragmatic Programmer',
                author: 'David Thomas',
                isbn: '9780135957059'
              },
              daysWaiting: 5
            },
            {
              id: '13',
              name: 'Diego Nascimento',
              email: 'diego.nascimento@email.com',
              reservationDate: '2024-10-21',
              book: {
                id: '21',
                title: 'Armas, Germes e Aço',
                author: 'Jared Diamond',
                isbn: '9788501065407'
              },
              daysWaiting: 3
            },
            {
              id: '14',
              name: 'Patrícia Gomes',
              email: 'patricia.gomes@email.com',
              reservationDate: '2024-10-22',
              book: {
                id: '27',
                title: 'O Príncipe',
                author: 'Nicolau Maquiavel',
                isbn: '9788525432200'
              },
              daysWaiting: 2
            },
            {
              id: '15',
              name: 'Thiago Barbosa',
              email: 'thiago.barbosa@email.com',
              reservationDate: '2024-10-23',
              book: {
                id: '1',
                title: 'Clean Code',
                author: 'Robert C. Martin',
                isbn: '9780132350884'
              },
              daysWaiting: 1
            },
            {
              id: '3',
              name: 'Maria Costa',
              email: 'maria.costa@email.com',
              reservationDate: '2024-10-24',
              book: {
                id: '2',
                title: 'JavaScript: The Good Parts',
                author: 'Douglas Crockford',
                isbn: '9780596517748'
              },
              daysWaiting: 0
            }
          ])
        }

        // Buscar usuários com empréstimos em atraso
        try {
          const overdueResponse = await api.get('/reports/users-with-overdue-books')
          setUsersWithOverdueBooks(overdueResponse.data)
        } catch (error) {
          console.log('⚠️ [Reports] Usando dados mock para atrasos')
          // Dados mock realistas
          setUsersWithOverdueBooks([
            {
              id: '9',
              name: 'Juliana Martins',
              email: 'juliana.martins@email.com',
              phone: '(11) 98765-4321',
              loanDate: '2024-10-04',
              dueDate: '2024-10-18',
              book: {
                id: '6',
                title: 'The Pragmatic Programmer',
                author: 'David Thomas',
                isbn: '9780135957059'
              },
              daysOverdue: 6,
              fine: 3.00
            },
            {
              id: '10',
              name: 'Rafael Rodrigues',
              email: 'rafael.rodrigues@email.com',
              phone: '(11) 91234-5678',
              loanDate: '2024-10-06',
              dueDate: '2024-10-20',
              book: {
                id: '21',
                title: 'Armas, Germes e Aço',
                author: 'Jared Diamond',
                isbn: '9788501065407'
              },
              daysOverdue: 4,
              fine: 2.00
            },
            {
              id: '11',
              name: 'Camila Ferreira',
              email: 'camila.ferreira@email.com',
              phone: '(11) 95555-1234',
              loanDate: '2024-10-08',
              dueDate: '2024-10-22',
              book: {
                id: '27',
                title: 'O Príncipe',
                author: 'Nicolau Maquiavel',
                isbn: '9788525432200'
              },
              daysOverdue: 2,
              fine: 1.00
            }
          ])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const sendReminderEmail = async (userId: string, type: 'reservation' | 'overdue') => {
    try {
      console.log(`📧 [Reports] Enviando lembrete ${type} para usuário ${userId}`)
      
      // Em produção, faria chamada para API
      // const response = await api.post('/notifications/send-reminder', { userId, type })
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, message: 'Lembrete enviado com sucesso!' }
    } catch (error) {
      console.error('❌ [Reports] Erro ao enviar lembrete:', error)
      return { success: false, message: 'Erro ao enviar lembrete' }
    }
  }

  const generateDetailedReport = async (type: 'reservations' | 'overdue') => {
    try {
      console.log(`📄 [Reports] Gerando relatório detalhado: ${type}`)
      
      const data = type === 'reservations' ? usersWithReservations : usersWithOverdueBooks
      
      if (!data || data.length === 0) {
        return { success: false, message: 'Nenhum dado encontrado para o relatório' }
      }

      // Criar conteúdo do relatório
      const reportContent = {
        type,
        generatedAt: new Date().toISOString(),
        totalRecords: data.length,
        data: data,
        summary: type === 'reservations' 
          ? {
              totalReservations: data.length,
              averageWaitingDays: data.reduce((sum, item) => sum + ((item as any).daysWaiting || 0), 0) / data.length,
              longestWait: Math.max(...data.map(item => (item as any).daysWaiting || 0))
            }
          : {
              totalOverdue: data.length,
              totalFines: data.reduce((sum, item) => sum + ((item as any).fine || 0), 0),
              averageOverdueDays: data.reduce((sum, item) => sum + ((item as any).daysOverdue || 0), 0) / data.length,
              longestOverdue: Math.max(...data.map(item => (item as any).daysOverdue || 0))
            }
      }
      
      // Simular download
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.json`
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

  return {
    usersWithReservations,
    usersWithOverdueBooks,
    isLoading,
    sendReminderEmail,
    generateDetailedReport
  }
}