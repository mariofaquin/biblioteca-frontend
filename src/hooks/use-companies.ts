'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Company {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface CompaniesFilters {
  per_page?: number
  page?: number
}

interface UseCompaniesResult {
  data: any
  isLoading: boolean
  error: any
  refetch: () => void
}

export function useCompanies(filters: CompaniesFilters = {}): UseCompaniesResult {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.page) params.append('page', filters.page.toString())
      
      const response = await api.get(`/companies?${params.toString()}`)
      console.log('🔍 Response completo:', response)
      console.log('🔍 Response.data:', response.data)
      
      // Se response.data já é um array, envolver em objeto
      if (Array.isArray(response.data)) {
        console.log('⚠️ API retornou array direto, convertendo para formato paginado')
        setData({
          data: response.data,
          total: response.data.length,
          current_page: 1,
          last_page: 1,
          per_page: response.data.length
        })
      } else {
        setData(response.data)
      }
    } catch (err: any) {
      setError(err)
      console.error('❌ Erro ao buscar empresas:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [filters.per_page, filters.page])

  return {
    data,
    isLoading,
    error,
    refetch: fetchCompanies
  }
}
