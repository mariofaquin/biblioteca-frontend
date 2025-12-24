'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/hooks/use-company'
import { Building2 } from 'lucide-react'

interface CompanyGuardProps {
  children: React.ReactNode
}

export function CompanyGuard({ children }: CompanyGuardProps) {
  const { user, selectedCompany, hasCompanyAccess, isLoading } = useCompany()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const checkAccess = () => {
      try {
        console.log('🔍 [CompanyGuard] Verificando acesso...', { user: !!user, selectedCompany: !!selectedCompany })
        
        // Se não há usuário, redirecionar para login
        if (!user) {
          console.log('🚪 [CompanyGuard] Sem usuário, redirecionando para login')
          router.push('/login')
          return
        }

        // Se é usuário root e não tem empresa selecionada
        if (user.is_root && !selectedCompany) {
          // Verificar se há empresas disponíveis
          const userCompanies = (user as any).companies || []
          
          if (userCompanies.length > 1) {
            // Múltiplas empresas: redirecionar para seleção
            console.log('👑 [CompanyGuard] ROOT com múltiplas empresas, redirecionando para seleção')
            router.push('/select-company')
            return
          } else if (userCompanies.length === 1) {
            // Uma empresa: selecionar automaticamente
            console.log('👑 [CompanyGuard] ROOT com 1 empresa, selecionando automaticamente')
            const company = userCompanies[0]
            localStorage.setItem('selected_company', JSON.stringify(company))
            
            // Atualizar user com empresa
            const updatedUser = {
              ...user,
              company_id: company.id,
              company_name: company.name,
              company_slug: company.slug
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            
            // Recarregar a página para aplicar mudanças
            window.location.reload()
            return
          } else {
            // Sem empresas: permitir acesso (Root pode ver tudo)
            console.log('👑 [CompanyGuard] ROOT sem empresas, permitindo acesso')
          }
        }

        // Se não é root e não tem acesso à empresa, erro
        if (!user.is_root && !hasCompanyAccess()) {
          console.log('❌ [CompanyGuard] Sem acesso à empresa, redirecionando para login')
          router.push('/login')
          return
        }

        // Tudo ok, permitir acesso
        console.log('✅ [CompanyGuard] Acesso permitido')
        
      } catch (error) {
        console.error('❌ [CompanyGuard] Erro na verificação de acesso:', error)
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [user, selectedCompany, hasCompanyAccess, isLoading, router])

  // Mostrar loading enquanto verifica
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Se chegou até aqui, tem acesso
  return <>{children}</>
}