import { useState, useEffect } from 'react'
import { loansService, Loan, Reservation } from '@/lib/services/loans'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'

// Hook para buscar empréstimos
export function useLoans(filters: { page?: number; per_page?: number } = {}) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const { user, isUser, isAdmin, isRoot } = usePermissions()

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setIsLoading(true)
        console.log('🔄 Hook useLoans: Iniciando busca de empréstimos');
        console.log('👤 Usuário atual:', { id: user?.id, role: user?.role, isUser: isUser(), isAdmin: isAdmin(), isRoot: isRoot() });
        
        // Aplicar filtro baseado no tipo de usuário
        let currentUserId = null
        let companyId = null
        
        if (isUser()) {
          currentUserId = user?.id
          console.log('🟢 USER: Filtrando apenas empréstimos do usuário:', currentUserId);
        } else if (isAdmin()) {
          companyId = user?.company_id
          console.log('🔵 ADMIN: Filtrando empréstimos da empresa:', companyId);
        } else if (isRoot()) {
          console.log('👑 ROOT: Mostrando todos os empréstimos');
        }
        
        const result = await loansService.getLoans({ 
          currentUserId, 
          companyId,
          page: filters.page,
          per_page: filters.per_page,
        });
        console.log('📊 Hook useLoans: Resultado recebido:', result);
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoans()
  }, [user?.id, user?.role, filters.page, filters.per_page])

  return { data, isLoading, error }
}

// Hook para buscar reservas
export function useReservations() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const { user, isUser, isAdmin, isRoot } = usePermissions()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true)
        console.log('🔄 [useReservations] Hook chamado');
        console.log('👤 Usuário atual:', { id: user?.id, role: user?.role, isUser: isUser(), isAdmin: isAdmin(), isRoot: isRoot() });
        
        // Aplicar filtro baseado no tipo de usuário
        let currentUserId = null
        let companyId = null
        
        if (isUser()) {
          currentUserId = user?.id
          console.log('🟢 USER: Filtrando apenas reservas do usuário:', currentUserId);
        } else if (isAdmin()) {
          companyId = user?.company_id
          console.log('🔵 ADMIN: Filtrando reservas da empresa:', companyId);
        } else if (isRoot()) {
          console.log('👑 ROOT: Mostrando todas as reservas');
        }
        
        const result = await loansService.getReservations({ currentUserId, companyId });
        console.log('📊 [useReservations] Resultado recebido do serviço:', result);
        console.log('📊 [useReservations] Número de reservas:', result?.data?.length || 0);
        
        if (result?.data?.length > 0) {
          console.log('✅ [useReservations] Reservas encontradas:', result.data.map(r => r.book.title));
        } else {
          console.log('⚠️ [useReservations] Nenhuma reserva encontrada');
        }
        
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
    
    // Refetch a cada 10 segundos
    const interval = setInterval(fetchReservations, 10000)
    
    return () => clearInterval(interval)
  }, [user?.id, user?.role])

  return { data, isLoading, error }
}

// Hook para renovar empréstimo
export function useRenewLoan() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ loanId, bookId }: { loanId: string; bookId: string }) => {
    try {
      setIsLoading(true)
      console.log('🔄 Hook useRenewLoan: Iniciando renovação', { loanId, bookId });
      const result = await loansService.renewLoan(loanId, bookId)
      console.log('✅ Hook useRenewLoan: Sucesso', result);
      
      // Usar alert temporariamente para garantir que a mensagem apareça
      alert(result.message || 'Empréstimo renovado com sucesso');
      
      toast({
        title: 'Sucesso!',
        description: result.message || 'Empréstimo renovado com sucesso',
      })
      return result
    } catch (error: any) {
      console.error('❌ Hook useRenewLoan: Erro', error);
      
      // Usar alert temporariamente para garantir que a mensagem apareça
      alert('Erro ao renovar empréstimo: ' + error.message);
      
      toast({
        title: 'Erro ao renovar empréstimo',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

// Hook para devolver livro
export function useReturnLoan() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (loanId: string) => {
    try {
      setIsLoading(true)
      console.log('🔄 Hook useReturnLoan: Iniciando devolução', { loanId });
      const result = await loansService.returnLoan(loanId)
      console.log('✅ Hook useReturnLoan: Sucesso', result);
      
      // Usar alert temporariamente para garantir que a mensagem apareça
      alert(result.message || 'Livro devolvido com sucesso');
      
      toast({
        title: 'Sucesso!',
        description: result.message || 'Livro devolvido com sucesso',
      })
      return result
    } catch (error: any) {
      console.error('❌ Hook useReturnLoan: Erro', error);
      
      // Usar alert temporariamente para garantir que a mensagem apareça
      alert('Erro ao devolver livro: ' + error.message);
      
      toast({
        title: 'Erro ao devolver livro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

// Hook para cancelar reserva
export function useCancelReservation() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (reservationId: string) => {
    try {
      setIsLoading(true)
      const result = await loansService.cancelReservation(reservationId)
      toast({
        title: 'Sucesso!',
        description: result.message || 'Reserva cancelada com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar reserva',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

// Hook para retirar livro (cumprir reserva)
export function useFulfillReservation() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (reservationId: string) => {
    try {
      setIsLoading(true)
      const result = await loansService.fulfillReservation(reservationId)
      toast({
        title: 'Sucesso!',
        description: result.message || 'Livro retirado com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao retirar livro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}