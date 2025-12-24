import api from '@/lib/api'

export interface Loan {
  id: string
  user_id: string
  book_id: string
  company_id?: string
  book?: {
    id: string
    title: string
    author: string
    isbn?: string
    cover_image?: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
  // Campos flat do backend
  book_title?: string
  book_author?: string
  book_isbn?: string
  book_tombo?: string
  user_name?: string
  user_email?: string
  borrowed_at: string
  due_date: string
  returned_at?: string
  return_date?: string
  status: 'active' | 'returned' | 'overdue'
  days_overdue: number
  can_renew: boolean
  renewal_count: number
  max_renewals: number
}

export interface Reservation {
  id: string
  user_id: string
  book_id: string
  book: {
    id: string
    title: string
    author: string
    isbn?: string
    cover_image?: string
  }
  reserved_at: string
  expires_at: string
  status: 'active' | 'expired' | 'fulfilled' | 'waiting' | 'ready' | 'cancelled'
  position_in_queue: number
  notified_at?: string
  // Campos flat do backend
  book_title?: string
  book_author?: string
  book_isbn?: string
  book_tombo?: string
  book_cover_image?: string
  company_name?: string
}

export interface LoansResponse {
  data: Loan[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface ReservationsResponse {
  data: Reservation[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// Dados mockados para desenvolvimento
let mockLoans: Loan[] = [
  {
    id: '1',
    user_id: '4223ef67-04e6-4aa7-8816-f3934ee1772c', // user@demo.com
    book_id: '1',
    company_id: 'comp1', // Biblioteca Central
    book: {
      id: '1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      cover_image: '',
    },
    borrowed_at: '2024-01-15T10:00:00Z',
    due_date: '2024-01-29T23:59:59Z',
    returned_at: undefined,
    status: 'active',
    days_overdue: 0,
    can_renew: true,
    renewal_count: 0,
    max_renewals: 2,
  },
  {
    id: '2',
    user_id: 'd4d6169c-ad59-4119-9851-cc4a53de0db1', // admin@demo.com
    book_id: '4',
    company_id: 'comp1', // Biblioteca Central
    book: {
      id: '4',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      isbn: '978-0596517748',
      cover_image: '',
    },
    borrowed_at: '2024-01-10T14:30:00Z',
    due_date: '2024-01-24T23:59:59Z',
    returned_at: '2024-01-23T16:45:00Z',
    status: 'returned',
    days_overdue: 0,
    can_renew: false,
    renewal_count: 1,
    max_renewals: 2,
  },
  {
    id: '3',
    user_id: '1fe6fb87-1d09-49bb-8a54-8aecf930e28c', // mario@accellog.com
    book_id: '3',
    company_id: 'comp2', // Biblioteca Norte
    book: {
      id: '3',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '978-8535926279',
      cover_image: '',
    },
    borrowed_at: '2024-01-05T09:15:00Z',
    due_date: '2024-01-19T23:59:59Z',
    returned_at: undefined,
    status: 'overdue',
    days_overdue: 3,
    can_renew: false,
    renewal_count: 0,
    max_renewals: 2,
  },
  // Mais empréstimos para testar filtros
  {
    id: '4',
    user_id: '4223ef67-04e6-4aa7-8816-f3934ee1772c', // user@demo.com
    book_id: '5',
    company_id: 'comp1', // Biblioteca Central
    book: {
      id: '5',
      title: 'Design Patterns',
      author: 'Gang of Four',
      isbn: '978-0201633612',
      cover_image: '',
    },
    borrowed_at: '2024-01-12T08:00:00Z',
    due_date: '2024-01-26T23:59:59Z',
    returned_at: undefined,
    status: 'active',
    days_overdue: 0,
    can_renew: true,
    renewal_count: 0,
    max_renewals: 2,
  },
  {
    id: '5',
    user_id: 'd4d6169c-ad59-4119-9851-cc4a53de0db1', // admin@demo.com
    book_id: '6',
    company_id: 'comp2', // Biblioteca Norte
    book: {
      id: '6',
      title: 'Refactoring',
      author: 'Martin Fowler',
      isbn: '978-0134757599',
      cover_image: '',
    },
    borrowed_at: '2024-01-08T14:00:00Z',
    due_date: '2024-01-22T23:59:59Z',
    returned_at: undefined,
    status: 'active',
    days_overdue: 0,
    can_renew: true,
    renewal_count: 1,
    max_renewals: 2,
  },
]

let mockReservations: Reservation[] = [
  {
    id: '1',
    user_id: '1',
    book_id: '2',
    book: {
      id: '2',
      title: 'O Alquimista',
      author: 'Paulo Coelho',
      isbn: '978-8576657224',
      cover_image: '',
    },
    reserved_at: '2024-01-20T11:30:00Z',
    expires_at: '2024-01-22T11:30:00Z',
    status: 'active',
    position_in_queue: 0,
    notified_at: '2024-01-20T11:30:00Z',
  },
  {
    id: '2',
    user_id: '1',
    book_id: '5',
    book: {
      id: '5',
      title: 'Design Patterns',
      author: 'Gang of Four',
      isbn: '978-0201633612',
      cover_image: '',
    },
    reserved_at: '2024-01-18T15:20:00Z',
    expires_at: '2024-01-20T15:20:00Z',
    status: 'active',
    position_in_queue: 2,
  },
]

interface SimpleFilters {
  currentUserId?: string | null
  companyId?: string | null
  page?: number
  per_page?: number
}

export const loansService = {
  async getLoans(filters?: SimpleFilters): Promise<LoansResponse> {
    try {
      console.log('📡 Buscando empréstimos da API...')
      
      // Buscar usuário atual
      let userId = null
      let isRoot = false
      let isAdmin = false
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!currentUser.id) {
          throw new Error('Usuário não está logado')
        }
        
        if (!currentUser.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          throw new Error('ID do usuário inválido')
        }
        
        userId = currentUser.id
        
        // Determinar papel do usuário
        isRoot = currentUser.is_root === true || currentUser.is_root === 'true'
        isAdmin = currentUser.email && (
          currentUser.email.includes('admin') || 
          currentUser.email.includes('root@')
        )
        
      } catch (error) {
        console.error('❌ Erro ao identificar usuário:', error)
        throw new Error('Usuário não identificado. Faça login novamente.')
      }
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado')
      }
      
      const userType = isRoot ? 'ROOT' : isAdmin ? 'ADMIN' : 'USER'
      console.log('👤 Usuário atual:', { userId, isRoot, isAdmin, userType });
      console.log('🔍 Filtros aplicados:', filters);
      
      // Construir parâmetros da query
      let queryParams = `user_id=${userId}&is_root=${isRoot}&is_admin=${isAdmin}`
      
      if (filters?.currentUserId) {
        queryParams += `&filter_user_id=${filters.currentUserId}`
      }
      
      // Adicionar parâmetros de paginação
      if (filters?.page) {
        queryParams += `&page=${filters.page}`
      }
      if (filters?.per_page) {
        queryParams += `&per_page=${filters.per_page}`
      }
      
      console.log('📡 Query params:', queryParams);
      
      const response = await api.get(`/loans?${queryParams}`)
      console.log('✅ Empréstimos recebidos da API:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro na API de empréstimos:', error)
      
      // Verificar se está em modo demo
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      
      if (isDemoMode) {
        console.log('🧪 Modo DEMO ativo - usando dados mockados')
        
        // Aplicar filtros simples nos dados mockados
        let filteredLoans = mockLoans
        
        console.log('🔍 Aplicando filtros simples:', filters)
        console.log('📊 Total de empréstimos mockados:', mockLoans.length)
        
        if (filters?.currentUserId) {
          console.log('🔍 Filtrando empréstimos para usuário:', filters.currentUserId)
          filteredLoans = mockLoans.filter(loan => {
            const match = loan.user_id === filters.currentUserId
            console.log(`📋 Empréstimo ${loan.id}: user_id=${loan.user_id}, filtro=${filters.currentUserId}, match=${match}`)
            return match
          })
        }
        else if (filters?.companyId) {
          console.log('🔍 Filtrando empréstimos para empresa:', filters.companyId)
          filteredLoans = mockLoans.filter(loan => {
            const match = loan.company_id === filters.companyId
            console.log(`📋 Empréstimo ${loan.id}: company_id=${loan.company_id}, filtro=${filters.companyId}, match=${match}`)
            return match
          })
        }
        else {
          console.log('🔍 Mostrando todos os empréstimos (ROOT)')
          filteredLoans = mockLoans
        }
        
        console.log('📊 Empréstimos filtrados:', filteredLoans.length, 'de', mockLoans.length)
        
        return {
          data: filteredLoans,
          pagination: {
            page: 1,
            per_page: filteredLoans.length,
            total: filteredLoans.length,
            total_pages: 1,
            has_next: false,
            has_prev: false
          }
        }
      } else {
        console.log('🏭 Modo PRODUÇÃO ativo - erro na API, não há fallback')
        throw new Error('Erro na API de empréstimos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
      }
    }
  },

  async getReservations(filters?: SimpleFilters): Promise<ReservationsResponse> {
    try {
      console.log('📋 [getReservations] Iniciando busca de reservas da API...')
      
      // Buscar usuário atual
      let userId = null
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!currentUser.id) {
          throw new Error('Usuário não está logado')
        }
        
        userId = currentUser.id
        console.log('📋 [getReservations] UserId:', userId)
        
      } catch (error) {
        console.error('❌ [getReservations] Erro ao identificar usuário:', error)
        return {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0,
        }
      }
      
      // Buscar reservas da API
      const queryParams = new URLSearchParams()
      
      if (filters?.currentUserId) {
        queryParams.append('user_id', filters.currentUserId)
      } else {
        queryParams.append('user_id', userId)
      }
      
      const response = await api.get(`/reservations?${queryParams.toString()}`)
      console.log('✅ [getReservations] Reservas recebidas da API:', response.data)
      
      // Converter para o formato esperado
      const reservations: Reservation[] = response.data.data.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        book_id: r.book_id,
        book: {
          id: r.book_id,
          title: r.book_title,
          author: r.book_author,
          isbn: r.book_isbn || '',
          cover_image: r.book_cover_image || ''
        },
        reserved_at: r.created_at,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: r.status === 'waiting' ? 'active' : r.status === 'ready' ? 'active' : r.status,
        position_in_queue: 1,
        notified_at: r.notified_at,
        book_title: r.book_title,
        book_author: r.book_author,
        book_isbn: r.book_isbn,
        book_cover_image: r.book_cover_image,
        company_name: r.company_name
      }))
      
      return {
        data: reservations,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: reservations.length,
      }
      
    } catch (error) {
      console.error('❌ [getReservations] Erro na API:', error)
      
      // Fallback para localStorage se API falhar
      console.log('⚠️ Usando fallback do localStorage')
      const reservationsStr = localStorage.getItem('user_reservations')
      const localReservations = JSON.parse(reservationsStr || '[]')
      
      const reservations: Reservation[] = localReservations.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        book_id: r.book_id,
        book: {
          id: r.book_id,
          title: r.book_title || 'Título não disponível',
          author: r.book_author || 'Autor não disponível',
          isbn: r.book_isbn || '',
          cover_image: r.book_cover_image || ''
        },
        reserved_at: r.reserved_at,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: r.status,
        position_in_queue: 1,
        notified_at: r.notified_at,
        book_title: r.book_title,
        book_author: r.book_author,
        book_isbn: r.book_isbn,
        book_cover_image: r.book_cover_image,
        company_name: r.company_name || 'Biblioteca Principal'
      }))
      
      return {
        data: reservations,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: reservations.length,
      }
    }
  },

  async renewLoan(loanId: string, bookId: string): Promise<ApiResponse<Loan>> {
    try {
      console.log(`📡 Serviço renewLoan: Iniciando renovação`, { loanId, bookId });
      
      // REGRA 1: Verificar se há reservas para este livro
      const reservations = JSON.parse(localStorage.getItem('user_reservations') || '[]')
      console.log('📋 Reservas encontradas:', reservations);
      
      const bookReservations = reservations.filter((r: any) => r.book_id === bookId && r.status === 'waiting')
      const hasReservations = bookReservations.length > 0
      
      console.log('📊 Verificação de reservas:', { bookId, bookReservations, hasReservations });
      
      if (hasReservations) {
        console.log('❌ Renovação bloqueada por reservas');
        throw new Error('Não é possível renovar. Há pessoas na fila de espera para este livro.')
      }
      
      // Enviar informação sobre reservas para o backend
      console.log('📡 Fazendo requisição para API...');
      const response = await api.put(`/loans/${loanId}/renew`, {
        has_reservations: hasReservations
      })
      
      console.log('✅ Resposta da API:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erro no serviço renewLoan:', error)
      
      // Se for erro da API, propagar a mensagem
      if (error.response?.data?.error) {
        console.log('📡 Erro da API:', error.response.data.error);
        throw new Error(error.response.data.error)
      }
      
      // Se for erro local (reservas), propagar
      if (error.message) {
        console.log('🔧 Erro local:', error.message);
        throw error
      }
      
      // Fallback genérico
      console.log('❓ Erro desconhecido');
      throw new Error('Erro ao renovar empréstimo')
    }
  },

  async returnLoan(loanId: string): Promise<ApiResponse<Loan>> {
    try {
      console.log(`📡 Devolvendo livro - empréstimo ${loanId}...`)
      const response = await api.put(`/loans/${loanId}/return`)
      console.log('✅ Livro devolvido:', response.data)
      
      // Atualizar reservas no localStorage se houver
      try {
        const reservationsStr = localStorage.getItem('user_reservations')
        console.log('📦 localStorage user_reservations:', reservationsStr)
        
        const reservations = JSON.parse(reservationsStr || '[]')
        const bookId = response.data.data.book_id
        
        console.log('🔍 Procurando reservas para o livro:', bookId)
        console.log('📋 Total de reservas:', reservations.length)
        console.log('📋 Reservas atuais:', JSON.stringify(reservations, null, 2))
        
        // Verificar cada reserva
        reservations.forEach((r: any, index: number) => {
          console.log(`📋 Reserva ${index}:`, {
            id: r.id,
            book_id: r.book_id,
            status: r.status,
            match: r.book_id === bookId && r.status === 'waiting'
          })
        })
        
        // Encontrar reserva aguardando para este livro
        const reservationIndex = reservations.findIndex((r: any) => 
          r.book_id === bookId && r.status === 'waiting'
        )
        
        if (reservationIndex !== -1) {
          // Atualizar status para 'ready' (disponível)
          reservations[reservationIndex].status = 'ready'
          reservations[reservationIndex].notified_at = new Date().toISOString()
          localStorage.setItem('user_reservations', JSON.stringify(reservations))
          console.log('📢 Reserva atualizada para status "ready":', reservations[reservationIndex])
          
          // Disparar evento customizado para notificar a UI
          const event = new CustomEvent('reservationReady', {
            detail: {
              reservation: reservations[reservationIndex],
              bookTitle: reservations[reservationIndex].book_title
            }
          })
          window.dispatchEvent(event)
          console.log('🔔 Evento reservationReady disparado')
          
          // Mostrar notificação do navegador se permitido
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📚 Livro Disponível!', {
              body: `O livro "${reservations[reservationIndex].book_title}" está disponível para retirada!`,
              icon: '/book-icon.png'
            })
          }
        } else {
          console.log('ℹ️ Nenhuma reserva aguardando encontrada para este livro')
        }
      } catch (storageError) {
        console.log('⚠️ Erro ao atualizar reservas no localStorage:', storageError)
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Erro ao devolver livro, usando fallback:', error)
      // Fallback mockado
      const loanIndex = mockLoans.findIndex(l => l.id === loanId)
      if (loanIndex === -1) throw new Error('Empréstimo não encontrado')
      
      mockLoans[loanIndex] = {
        ...mockLoans[loanIndex],
        returned_at: new Date().toISOString(),
        status: 'returned',
        can_renew: false,
      }
      
      return {
        data: mockLoans[loanIndex],
        message: 'Livro devolvido com sucesso',
      }
    }
  },

  async cancelReservation(reservationId: string): Promise<ApiResponse<null>> {
    try {
      console.log('🗑️ Cancelando reserva:', reservationId)
      const response = await api.delete(`/reservations/${reservationId}`)
      console.log('✅ Reserva cancelada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao cancelar reserva:', error)
      throw error
    }
  },

  async fulfillReservation(reservationId: string): Promise<ApiResponse<Loan>> {
    try {
      console.log('📚 Efetivando reserva:', reservationId)
      const response = await api.post(`/reservations/${reservationId}/fulfill`)
      console.log('✅ Reserva efetivada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao efetivar reserva:', error)
      throw error
    }
  },

  // Função para obter os dados mockados atuais (para debugging)
  getMockLoans(): Loan[] {
    return mockLoans
  },

  getMockReservations(): Reservation[] {
    return mockReservations
  }
}