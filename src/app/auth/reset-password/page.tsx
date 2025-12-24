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
  Lock,
  Shield,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string, name: string, expiresIn: string } | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordReset, setPasswordReset] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      verifyToken(tokenParam)
    } else {
      setTokenValid(false)
      setMessage({
        type: 'error',
        text: 'Token de recuperação não encontrado na URL.'
      })
    }
  }, [searchParams])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${tokenToVerify}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setTokenValid(true)
        setUserInfo({
          email: data.email,
          name: data.name,
          expiresIn: data.expiresIn
        })
      } else {
        setTokenValid(false)
        setMessage({
          type: 'error',
          text: data.error || 'Token inválido ou expirado'
        })
      }
    } catch (error) {
      console.error('Erro na verificação do token:', error)
      setTokenValid(false)
      setMessage({
        type: 'error',
        text: 'Erro ao verificar token. Tente novamente.'
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'Nova senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordReset(true)
        setMessage({
          type: 'success',
          text: data.message
        })
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/auth/login?message=password_reset_success')
        }, 3000)
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao redefinir senha'
        })
      }
    } catch (error) {
      console.error('Erro na redefinição:', error)
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

  // Se token é inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Link Inválido</CardTitle>
            <CardDescription>
              O link de recuperação não é válido ou expirou
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">❌ Possíveis causas:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• O link expirou (válido por 30 minutos)</li>
                <li>• O link já foi usado</li>
                <li>• O link está corrompido ou incompleto</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full"
              >
                Solicitar Nova Recuperação
              </Button>
              
              <Button 
                onClick={() => router.push('/auth/login')}
                variant="outline"
                className="w-full"
              >
                Voltar para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se senha foi redefinida com sucesso
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">🎉 Tudo pronto!</h3>
              <p className="text-sm text-green-700">
                Sua senha foi redefinida com sucesso. Você já pode fazer login com a nova senha.
              </p>
            </div>

            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Fazer Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Carregando verificação do token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando link de recuperação...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulário de redefinição de senha
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
          <CardDescription>
            Defina uma nova senha para sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Informações do usuário */}
          {userInfo && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Conta:</strong> {userInfo.email}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ⏰ Link expira em {userInfo.expiresIn}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Dicas de segurança */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Dicas para uma senha segura:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Use pelo menos 8 caracteres</li>
                    <li>• Combine letras, números e símbolos</li>
                    <li>• Evite informações pessoais</li>
                    <li>• Use uma senha única para cada conta</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mensagem de feedback */}
            {message && (
              <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
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
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                ← Voltar para login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}