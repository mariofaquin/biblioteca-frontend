'use client'

import { useMemo } from 'react'
import { useCompany } from './use-company'

export function usePermissions() {
  const { user, selectedCompany } = useCompany()

  // Memoizar as funções de verificação para evitar recálculos
  const permissions = useMemo(() => {
    try {
      // Verificar se é usuário básico (só vê próprios dados)
      const isUser = () => {
        return user?.role === 'user'
      }

      // Verificar se é admin (vê dados da empresa)
      const isAdmin = () => {
        return user?.role === 'admin'
      }

      // Verificar se é root (vê todos os dados)
      const isRoot = () => {
        return user?.role === 'root' || user?.is_root === true
      }

      // Verificar se pode ver dados de outros usuários
      const canViewOtherUsers = () => {
        return isAdmin() || isRoot()
      }

      // Verificar se pode editar dados de outros usuários
      const canEditOtherUsers = () => {
        return isAdmin() || isRoot()
      }

      // Verificar se pode ver empréstimos de outros usuários
      const canViewOtherLoans = () => {
        return isAdmin() || isRoot()
      }

      // Verificar se pode gerenciar livros
      const canManageBooks = () => {
        // Root pode gerenciar livros de qualquer empresa
        if (isRoot()) {
          return true
        }
        
        // Admin pode gerenciar livros da sua empresa
        if (isAdmin()) {
          return true
        }
        
        // User básico não pode gerenciar livros (apenas visualizar)
        return false
      }

      // Verificar se pode ver relatórios gerais
      const canViewReports = () => {
        return isAdmin() || isRoot()
      }

      // Verificar se pode trocar de empresa
      const canSwitchCompany = () => {
        return isRoot()
      }

      // Verificar se pode ver configurações da empresa
      const canViewCompanySettings = () => {
        return isAdmin() || isRoot()
      }

      // Obter filtros de dados baseados no nível do usuário
      const getDataFilters = () => {
        if (!user) {
          return { company_id: null, user_id: null, scope: 'none' as const }
        }

        if (isRoot()) {
          return {
            company_id: selectedCompany?.id || null,
            user_id: null,
            scope: 'all' as const
          }
        }

        if (isAdmin()) {
          return {
            company_id: user?.company_id || selectedCompany?.id,
            user_id: null,
            scope: 'company' as const
          }
        }

        return {
          company_id: user?.company_id || selectedCompany?.id,
          user_id: user?.id,
          scope: 'user' as const
        }
      }

      // Verificar se pode acessar dados de um usuário específico
      const canAccessUserData = (targetUserId: string) => {
        if (isRoot()) return true
        if (isAdmin() && user?.company_id === selectedCompany?.id) return true
        return user?.id === targetUserId
      }

      // Verificar se pode acessar dados de uma empresa específica
      const canAccessCompanyData = (companyId: string) => {
        if (isRoot()) return true
        return user?.company_id === companyId || selectedCompany?.id === companyId
      }

      return {
        user,
        selectedCompany,
        isUser,
        isAdmin,
        isRoot,
        canViewOtherUsers,
        canEditOtherUsers,
        canViewOtherLoans,
        canManageBooks,
        canViewReports,
        canSwitchCompany,
        canViewCompanySettings,
        getDataFilters,
        canAccessUserData,
        canAccessCompanyData,
      }
    } catch (error) {
      console.error('❌ [usePermissions] Erro:', error)
      
      // Retornar valores padrão em caso de erro
      return {
        user: null,
        selectedCompany: null,
        isUser: () => false,
        isAdmin: () => false,
        isRoot: () => false,
        canViewOtherUsers: () => false,
        canEditOtherUsers: () => false,
        canViewOtherLoans: () => false,
        canManageBooks: () => false,
        canViewReports: () => false,
        canSwitchCompany: () => false,
        canViewCompanySettings: () => false,
        getDataFilters: () => ({ company_id: null, user_id: null, scope: 'none' as const }),
        canAccessUserData: () => false,
        canAccessCompanyData: () => false,
      }
    }
  }, [user, selectedCompany])

  return permissions
}