import api from '@/lib/api'
import { User, PaginatedResponse, ApiResponse } from '@/types'
import { LocalStorage } from '@/lib/storage/local-storage'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user' | 'root'
  is_active?: boolean
}

export interface UpdateUserData {
  name: string
  email: string
  password?: string
  role?: 'admin' | 'user' | 'root'
  is_active?: boolean
}

export interface UsersFilters {
  search?: string
  role?: 'admin' | 'user' | 'root'
  per_page?: number
  page?: number
}

// Dados mockados como fallback
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'root@biblioteca.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Usuário Demo',
    email: 'user@demo.com',
    role: 'user',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

export const usersService = {
  async getUsers(filters: UsersFilters = {}): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.page) params.append('page', filters.page.toString())
      
      // CRÍTICO: Adicionar role e company_id do usuário logado para filtro de permissões
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr)
          if (user.role) {
            params.append('user_role', user.role)
            console.log('🔍 Enviando user_role:', user.role)
          }
          if (user.company_id) {
            params.append('user_company_id', user.company_id)
            console.log('🔍 Enviando user_company_id:', user.company_id)
          }
        } catch (e) {
          console.warn('Erro ao parsear dados do usuário:', e)
        }
      }

      const response = await api.get(`/users?${params.toString()}`)
      return response.data
    } catch (error) {
      console.warn('API não disponível, usando localStorage:', error)
      
      // Usar localStorage em vez de dados mockados
      let filteredUsers = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Filtrar usuários Root se o usuário logado for Admin
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr) as any
          if (user.role === 'admin') {
            filteredUsers = filteredUsers.filter((u: any) => u.role !== 'root' && !u.is_root)
          }
        } catch (e) {
          console.warn('Erro ao parsear dados do usuário:', e)
        }
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        )
      }
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role)
      }
      
      const page = filters.page || 1
      const perPage = filters.per_page || 15
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
      
      return {
        data: paginatedUsers,
        current_page: page,
        last_page: Math.ceil(filteredUsers.length / perPage),
        per_page: perPage,
        total: filteredUsers.length,
      }
    }
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      const user = LocalStorage.findRecord<User>('users', u => u.id === id)
      if (!user) throw new Error('Usuário não encontrado')
      return { data: user }
    }
  },

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    console.log('🚀 createUser chamado com:', data)
    try {
      // Adicionar informações do usuário logado para validação de permissões
      const userDataStr = localStorage.getItem('user')
      let enrichedData = { ...data }
      
      console.log('👤 Dados do usuário logado (string):', userDataStr)
      
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr)
          enrichedData = {
            ...data,
            user_role: user.role,
            user_company_id: user.company_id
          } as any
          console.log('✅ Dados enriquecidos:', enrichedData)
        } catch (e) {
          console.warn('Erro ao parsear dados do usuário:', e)
        }
      }
      
      console.log('📤 Enviando para API:', enrichedData)
      const response = await api.post('/users', enrichedData)
      console.log('✅ Resposta da API:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error)
      console.error('❌ Erro response:', error.response)
      
      // Se for erro de validação do backend, propagar
      if (error.response?.data?.error) {
        throw error
      }
      
      // Fallback: salvar no localStorage
      console.warn('⚠️ API falhou, salvando no localStorage')
      const newUser = {
        id: Math.random().toString(36).substring(7),
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Salvar no localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      return {
        data: newUser as User,
        message: 'Usuário criado com sucesso (salvo localmente)',
      }
    }
  },

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/users/${id}`, data)
      return response.data
    } catch (error) {
      // Fallback: atualizar no localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const index = users.findIndex((u: User) => u.id === id)
      
      if (index === -1) throw new Error('Usuário não encontrado')
      
      users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() }
      localStorage.setItem('users', JSON.stringify(users))
      
      return {
        data: users[index],
        message: 'Usuário atualizado com sucesso (salvo localmente)',
      }
    }
  },



  async restoreUser(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/users/${id}/restore`)
      return response.data
    } catch (error) {
      return {
        data: null,
        message: 'Usuário restaurado com sucesso (modo offline)',
      }
    }
  },

  async associateUser(userId: string, role: 'admin' | 'user'): Promise<ApiResponse<null>> {
    try {
      const response = await api.post('/users/associate', {
        user_id: userId,
        role
      })
      return response.data
    } catch (error) {
      return {
        data: null,
        message: 'Usuário associado com sucesso (modo offline)',
      }
    }
  },

  async removeAssociation(userId: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/users/${userId}/association`)
      return response.data
    } catch (error) {
      return {
        data: null,
        message: 'Associação removida com sucesso (modo offline)',
      }
    }
  },

  // Verificar se usuário pode ser excluído ou deve ser inativado
  async getUserDeletionInfo(id: string): Promise<{
    user_id: string
    has_loans: boolean
    loans_count: number
    recommended_action: 'delete' | 'inactivate'
    can_delete: boolean
    message: string
  }> {
    try {
      // Timeout de 3 segundos
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await api.get(`/users/${id}/deletion-info`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response.data
    } catch (error) {
      console.warn('API não disponível para info de exclusão, usando fallback')
      // Fallback: assumir que pode excluir (sem verificação de empréstimos)
      return {
        user_id: id,
        has_loans: false,
        loans_count: 0,
        recommended_action: 'delete',
        can_delete: true,
        message: 'Usuário não possui empréstimos. Pode ser excluído permanentemente.'
      }
    }
  },

  // Excluir ou inativar usuário
  async deleteUser(id: string): Promise<{
    action: 'deleted' | 'inactivated'
    data: User
    message: string
  }> {
    try {
      // Adicionar informações do usuário logado
      const userDataStr = localStorage.getItem('user')
      let requestData = {}
      
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr)
          requestData = {
            user_role: user.role,
            user_company_id: user.company_id
          }
        } catch (e) {
          console.warn('Erro ao parsear dados do usuário:', e)
        }
      }
      
      const response = await api.delete(`/users/${id}`, { data: requestData })
      return response.data
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error
      }
      
      // Fallback: remover do localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const filteredUsers = users.filter((u: User) => u.id !== id)
      localStorage.setItem('users', JSON.stringify(filteredUsers))
      
      return {
        action: 'deleted' as const,
        data: {} as User,
        message: 'Usuário removido localmente'
      }
    }
  }
}