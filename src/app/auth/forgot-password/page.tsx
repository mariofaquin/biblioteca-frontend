'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Mail, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        setMessage({
          type: 'success',
          text: data.message
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao solicitar recuperação de senha'
        })
      }
    } catch (error) {
      console.error('Erro na recuperação:', error)
      setMessage({
        type: 'error',
        text: 'Erro de conexão. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setEmail(value)
    
    // Limpar erro quando usuário começar a digitar
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <CardDescription>
              Instruções de recuperação foram enviadas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📧 Próximos passos:</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>1. Verifique sua caixa de entrada</li>
                <li>2. Procure por email da BiblioTech</li>
                <li>3. Clique no link de recuperação</li>
                <li>4. Defina sua nova senha</li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                ⏰ O link expira em 30 minutos por segurança
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Voltar para Login
              </Button>
              
              <Button 
                onClick={() => {
                  setEmailSent(false)
                  setMessage(null)
                }}
                variant="outline"
                className="w-full"
              >
                Enviar para outro email
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o email?{' '}
                <button 
                  onClick={() => {
                    setEmailSent(false)
                    setMessage(null)
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Tentar novamente
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email da sua conta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Informações de segurança */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Informações importantes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• O link de recuperação expira em 30 minutos</li>
                    <li>• Só funciona para contas com email verificado</li>
                    <li>• Verifique também a pasta de spam</li>
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
                  Enviando...
                </>
              ) : (
                'Enviar Instruções'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Lembrou da senha?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Fazer login
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Criar conta
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/landing" className="text-blue-600 hover:underline">
                <ArrowLeft className="inline h-3 w-3 mr-1" />
                Voltar para página inicial
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}