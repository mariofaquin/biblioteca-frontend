// Serviço para gerenciar reservas por empresa
export interface Reservation {
  id: string
  user_id: string
  user_name: string
  user_email: string
  book_id: string
  book_title: string
  book_author: string
  book_isbn: string
  book_tombo?: string
  book_cover_image?: string
  company_id: string
  company_name: string
  reserved_at: string
  status: 'waiting' | 'ready' | 'available' | 'cancelled' | 'cancelled_user' | 'cancelled_timeout' | 'fulfilled'
  position_in_queue: number
  notified_at?: string
}

export interface ReservationQueue {
  book_id: string
  book_title: string
  company_id: string
  reservations: Reservation[]
  total_waiting: number
}

class ReservationService {
  private getStorageKey(companyId?: string): string {
    return companyId ? `reservations_${companyId}` : 'reservations_global'
  }

  private getAllReservations(): Reservation[] {
    try {
      const reservations = localStorage.getItem('all_reservations') || '[]'
      return JSON.parse(reservations)
    } catch (error) {
      console.error('❌ Erro ao carregar reservas:', error)
      return []
    }
  }

  private saveAllReservations(reservations: Reservation[]): void {
    try {
      localStorage.setItem('all_reservations', JSON.stringify(reservations))
    } catch (error) {
      console.error('❌ Erro ao salvar reservas:', error)
    }
  }

  // Criar nova reserva
  async createReservation(data: {
    user_id: string
    user_name: string
    user_email: string
    book_id: string
    book_title: string
    book_author: string
    book_isbn: string
    book_cover_image?: string
    company_id: string
    company_name: string
  }): Promise<Reservation> {
    try {
      console.log('📡 Criando reserva na API...', data)
      
      // Criar reserva no banco de dados via API
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': data.company_id
        },
        body: JSON.stringify({
          user_id: data.user_id,
          book_id: data.book_id
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar reserva')
      }
      
      console.log('✅ Reserva criada no banco:', result.data)
      
      // Retornar no formato esperado
      const newReservation: Reservation = {
        id: result.data.id,
        ...data,
        reserved_at: result.data.created_at || new Date().toISOString(),
        status: result.data.status || 'waiting',
        position_in_queue: 1 // Será recalculado ao buscar
      }
      
      return newReservation
      
    } catch (error) {
      console.error('❌ Erro ao criar reserva na API:', error)
      
      // Fallback para localStorage se API falhar
      console.log('⚠️ Usando fallback do localStorage')
      
      const allReservations = this.getAllReservations()
      
      // Verificar se já existe reserva
      const existingReservation = allReservations.find(r => 
        r.user_id === data.user_id && 
        r.book_id === data.book_id && 
        r.company_id === data.company_id &&
        r.status === 'waiting'
      )
      
      if (existingReservation) {
        throw new Error('Você já está na fila de espera para este livro')
      }
      
      // Calcular posição na fila
      const bookReservationsInCompany = allReservations.filter(r => 
        r.book_id === data.book_id && 
        r.company_id === data.company_id &&
        r.status === 'waiting'
      )
      
      const position = bookReservationsInCompany.length + 1
      
      const newReservation: Reservation = {
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        reserved_at: new Date().toISOString(),
        status: 'waiting',
        position_in_queue: position
      }
      
      allReservations.push(newReservation)
      this.saveAllReservations(allReservations)
      
      console.log(`📋 Reserva criada no localStorage - Posição ${position}`)
      
      return newReservation
    }
  }

  // Obter reservas por empresa
  getReservationsByCompany(companyId: string): Reservation[] {
    const allReservations = this.getAllReservations()
    return allReservations.filter(r => r.company_id === companyId)
  }

  // Obter reservas de um usuário específico
  getUserReservations(userId: string, companyId?: string): Reservation[] {
    const allReservations = this.getAllReservations()
    return allReservations.filter(r => {
      const matchesUser = r.user_id === userId
      const matchesCompany = companyId ? r.company_id === companyId : true
      return matchesUser && matchesCompany
    })
  }

  // Obter fila de um livro específico em uma empresa
  getBookQueue(bookId: string, companyId: string): ReservationQueue {
    const allReservations = this.getAllReservations()
    const bookReservations = allReservations
      .filter(r => r.book_id === bookId && r.company_id === companyId && r.status === 'waiting')
      .sort((a, b) => new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime())
    
    // Recalcular posições na fila
    bookReservations.forEach((reservation, index) => {
      reservation.position_in_queue = index + 1
    })
    
    return {
      book_id: bookId,
      book_title: bookReservations[0]?.book_title || '',
      company_id: companyId,
      reservations: bookReservations,
      total_waiting: bookReservations.length
    }
  }

  // Processar devolução de livro (avançar fila)
  processBookReturn(bookId: string, companyId: string): Reservation | null {
    const allReservations = this.getAllReservations()
    const queue = this.getBookQueue(bookId, companyId)
    
    if (queue.reservations.length === 0) {
      console.log('📋 Nenhuma reserva na fila para este livro')
      return null
    }
    
    // Primeira pessoa da fila
    const nextReservation = queue.reservations[0]
    
    // Atualizar status para 'ready'
    const reservationIndex = allReservations.findIndex(r => r.id === nextReservation.id)
    if (reservationIndex !== -1) {
      allReservations[reservationIndex].status = 'ready'
      allReservations[reservationIndex].notified_at = new Date().toISOString()
      
      // Recalcular posições das reservas restantes
      const remainingReservations = allReservations.filter(r => 
        r.book_id === bookId && 
        r.company_id === companyId && 
        r.status === 'waiting'
      ).sort((a, b) => new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime())
      
      remainingReservations.forEach((reservation, index) => {
        const idx = allReservations.findIndex(r => r.id === reservation.id)
        if (idx !== -1) {
          allReservations[idx].position_in_queue = index + 1
        }
      })
      
      this.saveAllReservations(allReservations)
      
      console.log(`🎉 Livro disponível para: ${nextReservation.user_name} (${nextReservation.user_email})`)
      
      return allReservations[reservationIndex]
    }
    
    return null
  }

  // Cancelar reserva
  cancelReservation(reservationId: string): boolean {
    const allReservations = this.getAllReservations()
    const reservationIndex = allReservations.findIndex(r => r.id === reservationId)
    
    if (reservationIndex === -1) {
      return false
    }
    
    const reservation = allReservations[reservationIndex]
    const { book_id, company_id } = reservation
    
    // Remover reserva
    allReservations.splice(reservationIndex, 1)
    
    // Recalcular posições das reservas restantes
    const remainingReservations = allReservations.filter(r => 
      r.book_id === book_id && 
      r.company_id === company_id && 
      r.status === 'waiting'
    ).sort((a, b) => new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime())
    
    remainingReservations.forEach((res, index) => {
      const idx = allReservations.findIndex(r => r.id === res.id)
      if (idx !== -1) {
        allReservations[idx].position_in_queue = index + 1
      }
    })
    
    this.saveAllReservations(allReservations)
    
    console.log(`❌ Reserva cancelada - Fila atualizada`)
    
    return true
  }

  // Marcar reserva como cumprida (livro emprestado)
  fulfillReservation(reservationId: string): boolean {
    const allReservations = this.getAllReservations()
    const reservationIndex = allReservations.findIndex(r => r.id === reservationId)
    
    if (reservationIndex !== -1) {
      allReservations[reservationIndex].status = 'fulfilled'
      this.saveAllReservations(allReservations)
      return true
    }
    
    return false
  }

  // Obter estatísticas de reservas por empresa
  getCompanyStats(companyId: string): {
    total_reservations: number
    waiting_reservations: number
    ready_reservations: number
    most_requested_books: Array<{
      book_id: string
      book_title: string
      book_author: string
      reservation_count: number
    }>
  } {
    const reservations = this.getReservationsByCompany(companyId)
    
    const waiting = reservations.filter(r => r.status === 'waiting').length
    const ready = reservations.filter(r => r.status === 'ready').length
    
    // Livros mais solicitados
    const bookCounts = reservations.reduce((acc, r) => {
      const key = r.book_id
      if (!acc[key]) {
        acc[key] = {
          book_id: r.book_id,
          book_title: r.book_title,
          book_author: r.book_author,
          reservation_count: 0
        }
      }
      acc[key].reservation_count++
      return acc
    }, {} as Record<string, any>)
    
    const mostRequested = Object.values(bookCounts)
      .sort((a: any, b: any) => b.reservation_count - a.reservation_count)
      .slice(0, 5)
    
    return {
      total_reservations: reservations.length,
      waiting_reservations: waiting,
      ready_reservations: ready,
      most_requested_books: mostRequested
    }
  }

  // Simular notificação (em produção seria email/push)
  notifyUser(reservation: Reservation): void {
    console.log(`📧 NOTIFICAÇÃO ENVIADA:`)
    console.log(`Para: ${reservation.user_name} (${reservation.user_email})`)
    console.log(`Assunto: Livro "${reservation.book_title}" disponível!`)
    console.log(`Mensagem: O livro que você reservou está disponível para retirada.`)
    console.log(`Empresa: ${reservation.company_name}`)
    
    // Em produção, aqui seria integração com serviço de email/SMS
    if (typeof window !== 'undefined') {
      // Mostrar notificação no browser
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Livro Disponível - ${reservation.book_title}`, {
          body: `O livro "${reservation.book_title}" está disponível para retirada!`,
          icon: '/favicon.ico'
        })
      }
    }
  }
}

export const reservationService = new ReservationService()