'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Lock,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Verificar mensagens da URL
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')
    
    if (verified === 'true') {
      setMessage({
        type: 'success',
        text: 'Email verificado com sucesso! Você já pode fazer login.'
      })
    }
    
    if (error) {
      setMessage({
        type: 'error',
        text: decodeURIComponent(error)
      })
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message
        })
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirecionar para dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        // Tratar diferentes tipos de erro
        if (response.status === 401 && data.nextStep === 'verify_email') {
          setMessage({
            type: 'info',
            text: data.error
          })
          
          // Mostrar botão para reenviar verificação
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
          }, 3000)
        } else if (response.status === 423) {
          // Conta bloqueada
          setMessage({
            type: 'error',
            text: data.error
          })
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Erro no login'
          })
        }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setMessage({
        type: 'error',
        text: 'Erro de conexão. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Fazer Login</CardTitle>
          <CardDescription>
            Entre na sua conta do BiblioTech
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Mensagem de feedback */}
            {message && (
              <Alert className={
                message.type === 'error' ? 'border-red-500 bg-red-50' : 
                message.type === 'success' ? 'border-green-500 bg-green-50' :
                'border-blue-500 bg-blue-50'
              }>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Shield className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription className={
                  message.type === 'error' ? 'text-red-700' : 
                  message.type === 'success' ? 'text-green-700' :
                  'text-blue-700'
                }>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Botão de Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Criar conta
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Problemas com verificação de email?{' '}
              <Link href="/auth/verify-email" className="text-blue-600 hover:underline">
                Verificar email
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/landing" className="text-blue-600 hover:underline">
                ← Voltar para página inicial
              </Link>
            </p>
          </div>

          {/* Informações de segurança */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Sua conta está protegida com criptografia avançada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}