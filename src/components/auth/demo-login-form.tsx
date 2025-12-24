'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginFormData {
  email: string
  password: string
}

export function DemoLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    // Usuários demo disponíveis
    const demoUsers = [
      {
        email: 'demo@biblioteca.com',
        password: 'demo123',
        userData: {
          id: 'demo-user',
          name: 'Usuário Demo',
          email: 'demo@biblioteca.com',
          role: 'user',
          token: 'demo-token-user'
        }
      },
      {
        email: 'admin@demo.com',
        password: 'password',
        userData: {
          id: 'demo-admin',
          name: 'Admin Demo',
          email: 'admin@demo.com',
          role: 'admin',
          token: 'demo-token-admin'
        }
      },
      {
        email: 'root@biblioteca.com',
        password: 'password',
        userData: {
          id: 'demo-root',
          name: 'Administrador',
          email: 'root@biblioteca.com',
          role: 'root',
          token: 'demo-token-root'
        }
      }
    ]

    const matchedUser = demoUsers.find(user => 
      user.email === data.email && user.password === data.password
    )

    if (matchedUser) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('user', JSON.stringify(matchedUser.userData))
      localStorage.setItem('token', matchedUser.userData.token)

      console.log('Login demo realizado com sucesso!', matchedUser.userData)
      
      // Redirect para dashboard
      router.push('/dashboard')
    } else {
      console.error('Credenciais inválidas para demo')
      alert('Credenciais disponíveis:\n• demo@biblioteca.com / demo123 (Usuário)\n• admin@demo.com / password (Admin)\n• root@biblioteca.com / password (Root)')
    }
    
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Demo - Sistema Biblioteca
        </CardTitle>
        <CardDescription>
          Demonstração pública do sistema de biblioteca multiempresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@biblioteca.com"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              placeholder="demo123"
              {...register('password', {
                required: 'Senha é obrigatória'
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar na Demonstração'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-900 mb-2">🎯 Usuários de Demonstração</h4>
          <div className="space-y-2 text-xs text-blue-700">
            <p><strong>Usuário Demo:</strong> demo@biblioteca.com / demo123</p>
            <p><strong>Admin Demo:</strong> admin@demo.com / password</p>
            <p><strong>Administrador:</strong> root@biblioteca.com / password</p>
            <p className="text-blue-600 mt-2">💡 Use o <strong>Administrador</strong> para acessar a parametrização de banco</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Aviso:</strong> Esta é uma demonstração pública. 
            Todos os dados são simulados e não persistem entre sessões.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}