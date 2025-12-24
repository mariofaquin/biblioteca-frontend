'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronRight, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Company {
  id: string
  name: string
  slug: string
  description?: string
  userCount?: number
  bookCount?: number
  asaas_enabled?: boolean
}

interface CompanySelectorProps {
  user: {
    id: string
    name: string
    email: string
    is_root: boolean
    has_multiple_companies?: boolean
    companies?: Company[]
  }
  onCompanySelected: (company: Company) => void
}

export function CompanySelector({ user, onCompanySelected }: CompanySelectorProps) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Usar empresas do usuário se disponível, senão usar empresas mockadas
  const companies: Company[] = user.companies || [
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

  const handleCompanySelect = async (company: Company) => {
    try {
      setIsLoading(true)
      setSelectedCompany(company.id)
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar dados do usuário com a empresa selecionada
      const updatedUserData = {
        ...user,
        company_id: company.id,
        company_name: company.name,
        company_slug: company.slug,
        role: user.is_root ? 'root' : 'admin', // Root mantém privilégios, outros viram admin
        token: 'company-token-' + Math.random().toString(36).substring(2, 11)
      }
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      localStorage.setItem('token', updatedUserData.token)
      localStorage.setItem('selected_company', JSON.stringify(company))
      
      console.log('✅ Empresa selecionada:', company.name)
      console.log('👤 Dados atualizados:', updatedUserData)
      
      // Chamar callback
      onCompanySelected(company)
      
      // Redirecionar para dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('❌ Erro ao selecionar empresa:', error)
      alert('Erro ao selecionar empresa. Tente novamente.')
    } finally {
      setIsLoading(false)
      setSelectedCompany(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecione uma Empresa
          </h1>
          <p className="text-gray-600 mb-2">
            Olá, <strong>{user.name}</strong>! Você tem acesso a múltiplas empresas.
          </p>
          <p className="text-sm text-gray-500">
            Escolha qual empresa deseja acessar para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedCompany === company.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleCompanySelect(company)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {company.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Estatísticas */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{company.userCount} usuários</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{company.bookCount} livros</span>
                    </div>
                  </div>
                  
                  {/* Status do Asaas */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Integração Financeira:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      company.asaas_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {company.asaas_enabled ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  
                  {/* Botão de ação */}
                  <Button 
                    className="w-full mt-4" 
                    disabled={isLoading}
                    variant={selectedCompany === company.id ? "default" : "outline"}
                  >
                    {selectedCompany === company.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Acessando...
                      </>
                    ) : (
                      'Acessar Empresa'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Dica</span>
            </div>
            <p className="text-sm text-blue-700">
              Após selecionar uma empresa, você pode trocar rapidamente para outra 
              usando o seletor na barra superior, <strong>sem precisar fazer logout</strong>!
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Como usuário <strong>{user.is_root ? 'Root' : 'Administrador'}</strong>, 
            você tem acesso completo às funcionalidades da empresa selecionada.
          </p>
          
          <Button 
            variant="ghost" 
            onClick={() => {
              localStorage.clear()
              router.push('/login')
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            Fazer logout
          </Button>
        </div>
      </div>
    </div>
  )
}