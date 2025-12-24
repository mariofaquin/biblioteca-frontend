import { api } from '@/lib/api'

export interface UserCompany {
  id: string
  name: string
  slug: string
  description?: string
  role: 'admin' | 'user'
  associated_at: string
}

export interface AddUserCompanyData {
  company_id: string
  role: 'admin' | 'user'
}

export const userCompaniesService = {
  // Obter empresas de um usuário
  async getUserCompanies(userId: string): Promise<{ data: UserCompany[] }> {
    try {
      const response = await api.get(`/users/${userId}/companies`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar empresas do usuário:', error)
      throw error
    }
  },

  // Adicionar usuário a uma empresa
  async addUserToCompany(userId: string, data: AddUserCompanyData): Promise<{ data: any; message: string }> {
    try {
      const response = await api.post(`/users/${userId}/companies`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao vincular usuário à empresa:', error)
      throw error
    }
  },

  // Remover usuário de uma empresa
  async removeUserFromCompany(userId: string, companyId: string): Promise<{ data: null; message: string }> {
    try {
      const response = await api.delete(`/users/${userId}/companies/${companyId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao desvincular usuário da empresa:', error)
      throw error
    }
  }
}
