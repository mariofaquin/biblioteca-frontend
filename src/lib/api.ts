import axios from 'axios'
import Cookies from 'js-cookie'

// Para produção na Vercel, usar API Routes do Next.js (/api)
// Para desenvolvimento local, pode usar backend separado se configurado
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and company_id
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Adicionar company_id do localStorage
    try {
      // Tentar pegar de 'selected_company' primeiro
      let companyId = null
      
      const selectedCompany = localStorage.getItem('selected_company')
      if (selectedCompany) {
        const company = JSON.parse(selectedCompany)
        companyId = company.id
      }
      
      // Se não encontrou, tentar pegar do user.company_id
      if (!companyId) {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          companyId = user.company_id
        }
      }
      
      if (companyId) {
        config.headers['x-company-id'] = companyId
        console.log('🏢 Header x-company-id adicionado:', companyId)
      } else {
        console.warn('⚠️ company_id não encontrado no localStorage')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao adicionar company_id no header:', error)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      Cookies.remove('auth_token')
      Cookies.remove('user_data')
      Cookies.remove('company_data')
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api