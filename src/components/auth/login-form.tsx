'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})
  const router = useRouter()

  // Função para preencher credenciais de teste
  const fillTestCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
    setErrors({}) // Limpar erros
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação simples
    const newErrors: {email?: string, password?: string} = {}
    
    if (!email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    const data = { email, password }
    setIsLoading(true)
    
    // Validação com IDs reais do banco de dados
    const validUsers = [
      { 
        email: 'root@biblioteca.com', 
        password: 'password', 
        name: 'Root User', 
        role: 'root',
        id: 'ff297ab5-e1fe-4c63-8250-3986ceba314f',
        is_root: true,
        has_multiple_companies: false, // Root tem acesso a todas, mas vamos buscar da API
        companies: [] // Será preenchido pela API
      },
      { 
        email: 'admin@demo.com', 
        password: 'password', 
        name: 'Admin Demo', 
        role: 'admin',
        id: 'd4d6169c-ad59-4119-9851-cc4a53de0db1',
        is_root: false,
        has_multiple_companies: false, // Admin tem apenas uma empresa
        companies: [
          { id: 'comp1', name: 'Biblioteca Central', slug: 'biblioteca-central' }
        ]
      },
      { 
        email: 'user@demo.com', 
        password: 'password', 
        name: 'Usuário Demo', 
        role: 'user',
        id: '4223ef67-04e6-4aa7-8816-f3934ee1772c',
        is_root: false
      },
      { 
        email: 'mario@accellog.com', 
        password: 'password', 
        name: 'Mario', 
        role: 'user',
        id: '1fe6fb87-1d09-49bb-8a54-8aecf930e28c',
        is_root: false
      },
    ]

    let user = validUsers.find(u => u.email === data.email && u.password === data.password)
    // SEGURANÇA: Não logar dados sensíveis
    console.log('🔍 Tentativa de login para:', data.email.replace(/(.{2}).*@/, '$1***@'))

    // Se não encontrou nos usuários padrão, verificar usuários cadastrados no LocalStorage
    if (!user) {
      console.log('🔍 Verificando usuários cadastrados no LocalStorage...')
      
      try {
        // Buscar na estrutura do LocalStorage
        const storageData = JSON.parse(localStorage.getItem('biblioteca_multiempresa_data') || '{}')
        const registeredUsers = storageData.users || []
        console.log('👥 Usuários no LocalStorage:', registeredUsers)
        
        const registeredUser = registeredUsers.find((u: any) => u.email === data.email)
        if (registeredUser) {
          console.log('✅ Usuário encontrado no LocalStorage')
          // Para usuários cadastrados, a senha padrão é 'password' ou usar a senha digitada
          if (data.password === 'password' || data.password === registeredUser.password) {
            user = {
              id: registeredUser.id,
              name: registeredUser.name,
              email: registeredUser.email,
              password: 'password',
              role: registeredUser.role || 'user',
              is_root: false,
              has_multiple_companies: false
            } as any
            console.log('✅ Login autorizado para usuário cadastrado')
          } else {
            console.log('❌ Senha incorreta para usuário cadastrado')
          }
        } else {
          console.log('❌ Usuário não encontrado no LocalStorage')
        }
      } catch (error) {
        console.error('❌ Erro ao verificar LocalStorage:', error)
      }
    }

    // Primeiro tentar login via API (modo produção)
    try {
      console.log('🔗 Tentando login via API...', { email: data.email })
      const apiResponse = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email, password: data.password })
      })

      console.log('📥 Resposta da API:', apiResponse.status, apiResponse.statusText)

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('✅ Login via API realizado com sucesso')
        console.log('👤 Dados do usuário:', apiData.user)
        console.log('🏢 Empresas:', apiData.user.companies?.length || 0)
        
        // Usar empresas que vieram da API de login
        let companies = apiData.user.companies || []
        let selectedCompany = null // NÃO selecionar automaticamente aqui
        
        console.log('🏢 Empresas do usuário:', companies.length)
        
        // Se tem apenas 1 empresa, selecionar automaticamente
        if (companies.length === 1) {
          selectedCompany = companies[0]
          console.log('🏢 Uma empresa disponível, selecionando:', selectedCompany.name)
        } else if (companies.length > 1) {
          console.log('🏢 Múltiplas empresas, NÃO selecionando automaticamente')
        }
        
        const userData = {
          id: apiData.user.id,
          name: apiData.user.name,
          email: apiData.user.email,
          role: apiData.user.role,
          is_root: apiData.user.is_root,
          token: 'api-token-' + Math.random().toString(36).substring(2, 11),
          company_id: selectedCompany?.id || apiData.user.company_id,
          company_name: selectedCompany?.name,
          company_slug: selectedCompany?.slug,
          has_multiple_companies: companies.length > 1,
          companies: companies // IMPORTANTE: Salvar todas as empresas
        }

        console.log('💾 Salvando dados do usuário:', { ...userData, companies: `${companies.length} empresas` })
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.token)
        
        // Só salvar selected_company se tiver apenas 1 empresa
        if (selectedCompany && companies.length === 1) {
          localStorage.setItem('selected_company', JSON.stringify(selectedCompany))
          console.log('🏢 Empresa única selecionada:', selectedCompany.name)
        } else if (companies.length > 1) {
          // Remover selected_company se existir (para forçar seleção)
          localStorage.removeItem('selected_company')
          console.log('🏢 Múltiplas empresas - selected_company removido')
        }
        
        // Redirecionamento baseado no número de empresas
        if (companies.length > 1) {
          console.log('🏢 Múltiplas empresas disponíveis, redirecionando para seleção')
          router.push('/select-company')
        } else if (companies.length === 1) {
          console.log('🏢 Uma empresa disponível, redirecionando para dashboard')
          router.push('/dashboard')
        } else {
          console.log('⚠️ Nenhuma empresa disponível, redirecionando para dashboard')
          router.push('/dashboard')
        }
        
        setIsLoading(false)
        return
      } else {
        console.log('❌ Login via API falhou (status:', apiResponse.status, '), tentando modo demo...')
        const errorText = await apiResponse.text()
        console.log('❌ Erro da API:', errorText)
      }
    } catch (error) {
      console.log('❌ Erro na API, tentando modo demo...', error)
    }

    // Fallback para modo demo (validação local)
    if (user) {
      console.warn('⚠️ USANDO MODO DEMO - API não funcionou!')
      console.log('✅ Iniciando processo de login em modo demo...')
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Se é Root, buscar empresas da API
      let userCompanies = user.companies || []
      if (user.is_root) {
        try {
          console.log('👑 Root detectado, buscando empresas da API...')
          const companiesResponse = await fetch('http://localhost:8003/api/companies')
          if (companiesResponse.ok) {
            const result = await companiesResponse.json()
            const companiesData = result.data || result
            userCompanies = Array.isArray(companiesData) ? companiesData : []
            console.log('✅ Empresas carregadas para Root:', userCompanies.length)
          }
        } catch (error) {
          console.log('❌ Erro ao buscar empresas para Root:', error)
        }
      }
      
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_root: user.is_root,
        has_multiple_companies: userCompanies.length > 1,
        companies: userCompanies,
        token: 'demo-token-' + Math.random().toString(36).substring(2, 11),
        // Só definir empresa padrão para usuários simples com 1 empresa
        company_id: (userCompanies.length === 1) ? userCompanies[0].id : undefined,
        company_name: (userCompanies.length === 1) ? userCompanies[0].name : undefined,
        company_slug: (userCompanies.length === 1) ? userCompanies[0].slug : undefined
      }

      console.log('💾 Salvando dados no localStorage (dados sensíveis omitidos)')
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userData.token)
      
      // Salvar empresa padrão se há apenas 1
      if (userCompanies.length === 1) {
        const company = userCompanies[0] as any
        const companyData = {
          id: company.id,
          name: company.name,
          slug: company.slug,
          description: company.description || ''
        }
        localStorage.setItem('selected_company', JSON.stringify(companyData))
        console.log('🏢 Empresa única selecionada automaticamente:', companyData.name)
      }
      
      console.log('🔄 Verificando redirecionamento...')
      // Verificar se tem múltiplas empresas disponíveis
      const hasMultipleCompanies = userCompanies.length > 1
      
      if (hasMultipleCompanies) {
        console.log('🏢 Múltiplas empresas disponíveis, redirecionando para seleção')
        router.push('/select-company')
      } else if (userCompanies.length === 1) {
        console.log('🏢 Uma empresa disponível, redirecionando para dashboard')
        router.push('/dashboard')
      } else {
        console.log('⚠️ Nenhuma empresa disponível, redirecionando para dashboard')
        router.push('/dashboard')
      }
      
      // Aguardar um pouco mais para ver se o redirecionamento acontece
      setTimeout(() => {
        console.log('⏰ Timeout - verificando se ainda está na página de login')
        console.log('📍 URL atual:', window.location.href)
      }, 2000)
      
    } else {
      console.log('❌ Usuário não encontrado')
      alert('Email ou senha incorretos.\n\nPara usuários cadastrados, use a senha: password\nOu use um dos usuários de teste listados abaixo.')
    }
    
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Login
        </CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-sm text-blue-800 mb-2">🧪 Usuários de Demonstração:</h4>
          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => fillTestCredentials('root@biblioteca.com', 'password')}
              className="w-full bg-white p-2 rounded border hover:bg-blue-50 transition-colors text-left"
            >
              <p className="font-semibold text-blue-900">👑 Super Admin (ROOT)</p>
              <p className="text-blue-700">Email: <span className="font-mono">root@biblioteca.com</span></p>
              <p className="text-blue-700">Senha: <span className="font-mono">password</span></p>
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('admin@biblioteca.com', 'password')}
              className="w-full bg-white p-2 rounded border hover:bg-green-50 transition-colors text-left"
            >
              <p className="font-semibold text-green-900">👨‍💼 Administrador</p>
              <p className="text-green-700">Email: <span className="font-mono">admin@biblioteca.com</span></p>
              <p className="text-green-700">Senha: <span className="font-mono">password</span></p>
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('user@biblioteca.com', 'password')}
              className="w-full bg-white p-2 rounded border hover:bg-purple-50 transition-colors text-left"
            >
              <p className="font-semibold text-purple-900">👤 Usuário Comum</p>
              <p className="text-purple-700">Email: <span className="font-mono">user@biblioteca.com</span></p>
              <p className="text-purple-700">Senha: <span className="font-mono">password</span></p>
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2 italic">
            💡 Clique em qualquer usuário para preencher automaticamente
          </p>
        </div>
      </CardContent>
    </Card>
  )
}