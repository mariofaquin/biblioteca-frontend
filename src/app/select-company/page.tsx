'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Company {
  id: string
  name: string
  slug: string
  description?: string
  created_at?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  is_root: boolean
  companies?: Company[]
}

export default function SelectCompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoSelecting, setAutoSelecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar se já tem empresa selecionada (evitar loop)
    const selectedCompany = localStorage.getItem('selected_company')
    const userData = localStorage.getItem('user')
    
    if (selectedCompany && userData) {
      try {
        const user = JSON.parse(userData)
        // Se usuário já tem company_id, não precisa selecionar novamente
        if (user.company_id) {
          console.log('✅ Empresa já selecionada, redirecionando...')
          router.replace('/dashboard')
          return
        }
      } catch (e) {
        console.warn('Erro ao verificar empresa:', e)
      }
    }
    
    loadUserAndCompanies()
  }, [])

  const loadUserAndCompanies = async () => {
    try {
      // Verificar se usuário está logado
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Se o usuário já tem empresas no localStorage, usar elas
      if (parsedUser.companies && parsedUser.companies.length > 0) {
        // Se há apenas UMA empresa, selecionar automaticamente SEM MOSTRAR A TELA
        if (parsedUser.companies.length === 1) {
          console.log('🚀 Apenas uma empresa disponível, selecionando automaticamente...')
          setAutoSelecting(true)
          selectCompany(parsedUser.companies[0])
          return
        }
        
        setCompanies(parsedUser.companies)
        setLoading(false)
        return
      }

      // Caso contrário, buscar empresas da API
      console.log('🏢 Buscando empresas disponíveis...')
      const response = await fetch('http://localhost:8003/api/companies')
      
      if (response.ok) {
        const result = await response.json()
        // A API retorna { data: [...] }
        const companiesData = result.data || result
        const companiesArray = Array.isArray(companiesData) ? companiesData : []
        console.log('✅ Empresas carregadas:', companiesArray.length)
        
        // Se há apenas UMA empresa, selecionar automaticamente SEM MOSTRAR A TELA
        if (companiesArray.length === 1) {
          console.log('🚀 Apenas uma empresa disponível, selecionando automaticamente...')
          setAutoSelecting(true)
          selectCompany(companiesArray[0])
          return
        }
        
        setCompanies(companiesArray)
      } else {
        throw new Error('Erro ao carregar empresas')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      setError('Erro ao carregar empresas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const selectCompany = (company: Company) => {
    console.log('🏢 Empresa selecionada:', company.name)
    
    // Salvar empresa selecionada
    localStorage.setItem('selected_company', JSON.stringify(company))
    
    // Atualizar dados do usuário com a empresa
    if (user) {
      const updatedUser = {
        ...user,
        company_id: company.id,
        company_name: company.name,
        company_slug: company.slug
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    
    // Redirecionar para dashboard (usar replace para não voltar)
    router.replace('/dashboard')
  }

  if (loading || autoSelecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {autoSelecting ? 'Selecionando empresa...' : 'Carregando empresas...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUserAndCompanies} className="w-full">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecione uma Empresa
          </h1>
          <p className="text-gray-600">
            Olá, <strong>{user?.name}</strong>! Escolha a empresa para acessar o sistema.
          </p>
        </div>

        {companies.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Nenhuma Empresa Encontrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Não há empresas disponíveis para sua conta.
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                onClick={() => selectCompany(company)}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">
                    🏢 {company.name}
                  </CardTitle>
                  {company.description && (
                    <CardDescription>
                      {company.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>ID:</strong> {company.id}</p>
                    <p><strong>Slug:</strong> {company.slug}</p>
                    {company.created_at && (
                      <p><strong>Criada em:</strong> {new Date(company.created_at).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  <Button className="w-full mt-4">
                    Selecionar Empresa
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.clear()
              router.push('/')
            }}
          >
            Fazer Logout
          </Button>
        </div>
      </div>
    </div>
  )
}