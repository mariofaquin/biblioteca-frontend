'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginTest() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const testUsers = [
    { 
      email: 'root@biblioteca.com', 
      password: 'password', 
      name: 'Root User', 
      role: 'root',
      id: 'ff297ab5-e1fe-4c63-8250-3986ceba314f',
      is_root: true
    },
    { 
      email: 'admin@demo.com', 
      password: 'password', 
      name: 'Admin Demo', 
      role: 'admin',
      id: 'd4d6169c-ad59-4119-9851-cc4a53de0db1',
      is_root: false
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
    }
  ]

  const testLogin = async (user: any) => {
    setIsLoading(true)
    console.log('🧪 Testando login para:', user.name)
    
    try {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_root: user.is_root,
        token: 'demo-token-' + Math.random().toString(36).substring(2, 11),
        company_id: user.is_root ? undefined : 'comp1',
        company_name: user.is_root ? undefined : 'Biblioteca Central',
        company_slug: user.is_root ? undefined : 'biblioteca-central'
      }

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userData.token)

      console.log('✅ Login realizado:', userData)
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (user.is_root) {
        console.log('👑 Redirecionando root para seleção de empresa')
        router.push('/select-company')
      } else {
        console.log('👤 Redirecionando usuário para dashboard')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Erro no login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkCurrentUser = () => {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    console.log('👤 Usuário atual:', userStr ? JSON.parse(userStr) : 'Nenhum')
    console.log('🔑 Token atual:', token)
    
    if (userStr) {
      const user = JSON.parse(userStr)
      alert(`Usuário logado: ${user.name} (${user.role})`)
    } else {
      alert('Nenhum usuário logado')
    }
  }

  const clearLogin = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('selected_company')
    console.log('🧹 Login limpo')
    alert('Login limpo! Faça login novamente.')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste de Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Usuários Disponíveis:</h4>
          {testUsers.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => testLogin(user)}
              disabled={isLoading}
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email} ({user.role})</p>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <Button variant="secondary" onClick={checkCurrentUser} className="w-full">
            Verificar Usuário Atual
          </Button>
          <Button variant="destructive" onClick={clearLogin} className="w-full">
            Limpar Login
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <strong>Root</strong>: Precisa selecionar empresa</p>
          <p>• <strong>Admin/User</strong>: Vai direto para dashboard</p>
          <p>• Todos usam senha: <code>password</code></p>
        </div>
      </CardContent>
    </Card>
  )
}