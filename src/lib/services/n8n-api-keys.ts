export interface N8NApiKey {
  id: string
  company_id: string
  name: string
  api_key?: string
  rate_limit: number
  expires_at: string
  created_at: string
  is_active: boolean
  last_used_at?: string
  created_by?: string
}

export interface CreateN8NApiKeyData {
  name: string
  expires_in_days: number
  rate_limit: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export const n8nApiKeysService = {
  async listApiKeys(): Promise<ApiResponse<N8NApiKey[]>> {
    const selectedCompany = localStorage.getItem('selected_company')
    if (!selectedCompany) {
      throw new Error('Empresa não selecionada')
    }
    
    const company = JSON.parse(selectedCompany)
    const companyId = company.id
    
    const response = await fetch(
      `http://localhost:8003/api/admin/n8n/api-keys?company_id=${companyId}`
    )
    
    if (!response.ok) {
      throw new Error('Erro ao buscar API Keys')
    }
    return response.json()
  },

  async createApiKey(data: CreateN8NApiKeyData): Promise<ApiResponse<N8NApiKey>> {
    const selectedCompany = localStorage.getItem('selected_company')
    const userData = localStorage.getItem('user')
    
    if (!selectedCompany || !userData) {
      throw new Error('Dados de autenticação não encontrados')
    }
    
    const company = JSON.parse(selectedCompany)
    const user = JSON.parse(userData)
    
    const response = await fetch('http://localhost:8003/api/admin/n8n/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        company_id: company.id,
        created_by: user.email,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar API Key')
    }
    
    return response.json()
  },

  async revokeApiKey(id: string): Promise<ApiResponse<void>> {
    const selectedCompany = localStorage.getItem('selected_company')
    if (!selectedCompany) {
      throw new Error('Empresa não selecionada')
    }
    
    const company = JSON.parse(selectedCompany)
    
    const response = await fetch(
      `http://localhost:8003/api/admin/n8n/api-keys/${id}?company_id=${company.id}`,
      {
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      throw new Error('Erro ao revogar API Key')
    }
    
    return response.json()
  }
}
