'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronDown, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CompanySwitchToast } from '@/components/ui/company-switch-toast'
import { useCompany } from '@/hooks/use-company'
import { Empresa } from '@/types'

export function CompanyDropdown() {
  const { selectedCompany, selectCompany, user } = useCompany()
  const [isChanging, setIsChanging] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastData, setToastData] = useState<{ from?: string; to: string } | null>(null)
  const router = useRouter()

  // Empresas disponíveis - usar empresas do usuário se disponível (para admins)
  const companies: Empresa[] = (user as any)?.companies || [
    {
      id: 'comp1',
      nome: 'Biblioteca Central',
      slug: 'biblioteca-central',
      descricao: 'Biblioteca principal da organização',
      ativa: true,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    },
    {
      id: 'comp2', 
      nome: 'Biblioteca Filial Norte',
      slug: 'biblioteca-norte',
      descricao: 'Filial da região norte da cidade',
      ativa: true,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    },
    {
      id: 'comp3',
      nome: 'Biblioteca Universitária',
      slug: 'biblioteca-universitaria', 
      descricao: 'Biblioteca especializada em conteúdo acadêmico',
      ativa: true,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    }
  ]

  const handleCompanyChange = async (company: Empresa) => {
    if (company.id === selectedCompany?.id) return

    try {
      setIsChanging(true)
      
      console.log('🔄 Trocando empresa:', {
        from: selectedCompany?.nome,
        to: company.nome
      })
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Salvar dados para o toast
      const fromCompanyName = selectedCompany?.nome
      
      // Atualizar empresa usando o hook
      selectCompany(company)
      
      // Atualizar token com nova empresa
      const updatedUserData = {
        ...user,
        company_id: company.id,
        company_name: company.nome,
        company_slug: company.slug,
        token: 'company-token-' + Math.random().toString(36).substring(2, 11)
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      localStorage.setItem('token', updatedUserData.token)
      
      console.log('✅ Empresa trocada com sucesso:', company.nome)
      
      // Mostrar toast de sucesso
      setToastData({
        from: fromCompanyName,
        to: company.nome
      })
      setShowToast(true)
      
      // Recarregar a página após um pequeno delay para mostrar o toast
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Erro ao trocar empresa:', error)
      alert('Erro ao trocar empresa. Tente novamente.')
    } finally {
      setIsChanging(false)
    }
  }

  // Mostrar dropdown para ROOT ou ADMIN com múltiplas empresas
  const canSwitchCompany = (user as any)?.is_root || (user as any)?.has_multiple_companies
  
  console.log('🔍 CompanyDropdown Debug:', {
    user: user ? { id: user.id, role: user.role, is_root: (user as any).is_root, has_multiple_companies: (user as any).has_multiple_companies } : null,
    selectedCompany: selectedCompany ? { id: selectedCompany.id, nome: selectedCompany.nome } : null,
    canSwitchCompany
  })
  
  if (!selectedCompany || !canSwitchCompany) {
    console.log('❌ CompanyDropdown não será exibido:', { selectedCompany: !!selectedCompany, canSwitchCompany })
    return null
  }

  return (
    <>
      {/* Toast de notificação */}
      {showToast && toastData && (
        <CompanySwitchToast
          fromCompany={toastData.from}
          toCompany={toastData.to}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
          disabled={isChanging}
        >
          <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-blue-800 max-w-16 sm:max-w-32 truncate">
            {selectedCompany.nome}
          </span>
          <ChevronDown className="w-3 h-3 text-blue-600 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 sm:w-80">
        <DropdownMenuLabel className="flex items-center">
          <Building2 className="w-4 h-4 mr-2" />
          Selecionar Empresa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleCompanyChange(company)}
            className="flex flex-col items-start p-3 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center">
                <span className="font-medium text-sm">
                  {company.nome}
                </span>
                {company.id === selectedCompany.id && (
                  <Check className="w-4 h-4 ml-2 text-green-600" />
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-2">
              {company.descricao}
            </p>
            
            <div className="flex items-center justify-between w-full text-xs text-gray-600">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{company.userCount} usuários</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                <span>{company.bookCount} livros</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                company.asaas_enabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {company.asaas_enabled ? 'Asaas' : 'Sem Asaas'}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => router.push('/select-company')}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Ver todas as empresas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}