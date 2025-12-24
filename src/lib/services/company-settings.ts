import api from '@/lib/api'

export interface CompanySettings {
  id: string
  company_id: string
  
  // Configurações de Empréstimo
  loan_duration_days: number
  max_renewals: number
  renewal_duration_days: number
  max_books_per_user: number
  overdue_fine_per_day: number
  
  // Configurações de Reserva
  reservation_expiry_hours: number
  max_reservations_per_user: number
  notification_hours_before_expiry: number
  
  // Configurações Gerais
  company_name: string
  company_logo_url?: string
  primary_color: string
  secondary_color: string
  contact_email: string
  contact_phone?: string
  address?: string
  
  // Configurações de Notificação
  email_notifications_enabled: boolean
  sms_notifications_enabled: boolean
  reminder_days_before_due: number
  
  // Configurações Financeiras
  asaas_enabled: boolean
  asaas_api_key?: string
  subscription_required: boolean
  monthly_fee: number
  
  created_at: string
  updated_at: string
}

export interface UpdateCompanySettingsData {
  // Configurações de Empréstimo
  loan_duration_days?: number
  max_renewals?: number
  renewal_duration_days?: number
  max_books_per_user?: number
  overdue_fine_per_day?: number
  
  // Configurações de Reserva
  reservation_expiry_hours?: number
  max_reservations_per_user?: number
  notification_hours_before_expiry?: number
  
  // Configurações Gerais
  company_name?: string
  company_logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  
  // Configurações de Notificação
  email_notifications_enabled?: boolean
  sms_notifications_enabled?: boolean
  reminder_days_before_due?: number
  
  // Configurações Financeiras
  asaas_enabled?: boolean
  asaas_api_key?: string
  subscription_required?: boolean
  monthly_fee?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export const companySettingsService = {
  async getSettings(): Promise<ApiResponse<CompanySettings>> {
    const response = await api.get('/company/settings')
    return response.data
  },

  async updateSettings(data: UpdateCompanySettingsData): Promise<ApiResponse<CompanySettings>> {
    const response = await api.put('/company/settings', data)
    return response.data
  },

  async resetToDefaults(): Promise<ApiResponse<CompanySettings>> {
    const response = await api.post('/company/settings/reset')
    return response.data
  }
}