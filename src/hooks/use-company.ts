'use client'

import { useState, useEffect } from 'react'
import { Empresa } from '@/types'

interface User {
  id: string
  name: string
  email: string
  role: string
  is_root: boolean
  company_id?: string
  company_name?: string
  company_slug?: string
}

export function useCompany() {
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = () => {
    try {
      setIsLoading(true)
      
      // Carregar dados do usuário
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        
        // Se o usuário tem empresa definida, carregar dados da empresa
        if (userData.company_id) {
          const companyStr = localStorage.getItem('selected_company')
          if (companyStr) {
            const companyData = JSON.parse(companyStr)
            setSelectedCompany(companyData)
          } else {
            // Criar objeto de empresa baseado nos dados do usuário
            const companyFromUser: Empresa = {
              id: userData.company_id,
              nome: userData.company_name || 'Empresa Selecionada',
              slug: userData.company_slug || 'empresa',
              ativa: true,
              data_criacao: new Date().toISOString(),
              data_atualizacao: new Date().toISOString()
            }
            setSelectedCompany(companyFromUser)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectCompany = (company: Empresa) => {
    try {
      // Atualizar empresa selecionada
      setSelectedCompany(company)
      localStorage.setItem('selected_company', JSON.stringify(company))
      
      // Atualizar dados do usuário com a empresa
      if (user) {
        const updatedUser = {
          ...user,
          company_id: company.id,
          company_name: company.nome,
          company_slug: company.slug,
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      console.log('✅ Empresa selecionada:', company.nome)
      
      // Limpar caches relacionados à empresa anterior
      clearCompanyRelatedCaches()
      
    } catch (error) {
      console.error('❌ Erro ao selecionar empresa:', error)
    }
  }

  const clearCompanyRelatedCaches = () => {
    try {
      // Limpar dados específicos da empresa anterior
      localStorage.removeItem('user_reservations')
      
      // Invalidar cache do React Query se disponível
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        const queryClient = (window as any).queryClient
        queryClient.invalidateQueries({ queryKey: ['books'] })
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        queryClient.invalidateQueries({ queryKey: ['reservations'] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
        console.log('🔄 Caches do React Query invalidados')
      }
      
      console.log('🧹 Caches da empresa anterior limpos')
    } catch (error) {
      console.error('❌ Erro ao limpar caches:', error)
    }
  }

  const clearCompany = () => {
    setSelectedCompany(null)
    localStorage.removeItem('selected_company')
    
    if (user) {
      const updatedUser = {
        ...user,
        company_id: undefined,
        company_name: undefined,
        company_slug: undefined,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const hasCompanyAccess = () => {
    return user?.is_root || (user?.company_id && selectedCompany)
  }

  const isRoot = () => {
    return user?.is_root === true
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'root'
  }

  const canAccessMultipleCompanies = () => {
    return user?.is_root === true
  }

  return {
    selectedCompany,
    user,
    isLoading,
    selectCompany,
    clearCompany,
    hasCompanyAccess,
    isRoot,
    isAdmin,
    canAccessMultipleCompanies,
    refreshCompanyData: loadCompanyData,
  }
}