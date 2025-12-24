'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronDown, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanySwitchToast } from '@/components/ui/company-switch-toast'
import { useCompany } from '@/hooks/use-company'
import { Company } from '@/types'

export function SimpleCompanyDropdown() {
  const { selectedCompany, selectCompany, user } = useCompany()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastData, setToastData] = useState<{ from?: string; to: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Empresas disponíveis
  const companies: Company[] = (user as any)?.companies || [
    {
      id: 'comp1',
      name: 'Biblioteca Central',
      slug: 'biblioteca-central',
      description: 'Biblioteca principal da organização',
      userCount: 150,
      bookCount: 2500,
      asaas_enabled: true
    },
    {
      id: 'comp2', 
      name: 'Biblioteca Filial Norte',
      slug: 'biblioteca-norte',
      description: 'Filial da região norte da cidade',
      userCount: 85,
      bookCount: 1200,
      asaas_enabled: false
    },
    {
      id: 'comp3',
      name: 'Biblioteca Universitária',
      slug: 'biblioteca-universitaria', 
      description: 'Biblioteca especializada em conteúdo acadêmico',
      userCount: 320,
      bookCount: 4800,
      asaas_enabled: true
    }
  ]

  const handleCompanyChange = async (company: Company) => {
    if (company.id === selectedCompany?.id) {
      setIsOpen(false)
      return
    }

    try {
      setIsChanging(true)
      setIsOpen(false)
      
      console.log('🔄 Trocando empresa:', {
        from: selectedCompany?.name,
        to: company.name
      })
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Salvar dados para o toast
      const fromCompanyName = selectedCompany?.name
      
      // Atualizar empresa usando o hook
      selectCompany(company)
      
      // Atualizar token com nova empresa
      const updatedUserData = {
        ...user,
        company_id: company.id,
        company_name: company.name,
        company_slug: company.slug,
        token: 'company-token-' + Math.random().toString(36).substring(2, 11)
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      localStorage.setItem('token', updatedUserData.token)
      
      console.log('✅ Empresa trocada com sucesso:', company.name)
      
      // Mostrar toast de sucesso
      setToastData({
        from: fromCompanyName,
        to: company.name
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
  
  if (!selectedCompany || !canSwitchCompany) {
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
      
      <div className="relative" ref={dropdownRef}>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
          disabled={isChanging}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-blue-800 max-w-16 sm:max-w-32 truncate">
            {selectedCompany.name}
          </span>
          <ChevronDown className={`w-3 h-3 text-blue-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Selecionar Empresa</span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleCompanyChange(company)}
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {company.name}
                      </span>
                      {company.id === selectedCompany.id && (
                        <Check className="w-4 h-4 ml-2 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {company.description}
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
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/select-company')
                }}
                className="flex items-center w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded text-sm"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Ver todas as empresas
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}