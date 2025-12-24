'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Pegar email da URL se disponível
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }

    // Verificar se há token na URL (quando usuário clica no link do email)
    const token = searchParams.get('token')
    if (token) {
      verifyEmailToken(token)
    }

    // Verificar se há erro na URL
    const error = searchParams.get('error')
    if (error) {
      setStatus('error')
      switch (error) {
        case 'token_missing':
          setMessage('Token de verificação não encontrado.')
          break
        case 'server_error':
          setMessage('Erro interno do servidor. Tente novamente.')
          break
        default:
          setMessage(decodeURIComponent(error))
      }
    }

    // Verificar se email foi verificado com sucesso
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setStatus('success')
      setMessage('Email verificado com sucesso! Você já pode fazer login.')
    }
  }, [searchParams])

  const verifyEmailToken = async (token: string) => {
    setStatus('verifying')
    setMessage('Verificando seu email...')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/auth/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Erro na verificação do email')
      }
    } catch (error) {
      console.error('Erro na verificação:', error)
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage('Email não informado. Faça o cadastro novamente.')
      return
    }

    setStatus('verifying')
    setMessage('Reenviando email de verificação...')

    try {
      // Aqui você pode implementar uma API para reenviar o email
      // Por enquanto, vamos simular
      setTimeout(() => {
        setStatus('waiting')
        setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.')
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage('Erro ao reenviar email. Tente novamente.')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />
      default:
        return <Mail className="h-12 w-12 text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      case 'verifying':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
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
          <CardTitle className="text-2xl font-bold">Verificar Email</CardTitle>
          <CardDescription>
            {status === 'waiting' && 'Confirme seu email para ativar sua conta'}
            {status === 'verifying' && 'Verificando seu email...'}
            {status === 'success' && 'Email verificado com sucesso!'}
            {status === 'error' && 'Erro na verificação do email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Visual */}
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            
            {email && (
              <p className="text-sm text-gray-600 text-center">
                Email: <span className="font-medium">{email}</span>
              </p>
            )}
          </div>

          {/* Mensagem de Status */}
          {message && (
            <Alert className={getStatusColor()}>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Instruções baseadas no status */}
          {status === 'waiting' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📧 Verifique seu email</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Enviamos um link de verificação para seu email. Clique no link para ativar sua conta.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Verifique sua caixa de entrada</li>
                  <li>• Verifique a pasta de spam/lixo eletrônico</li>
                  <li>• O link expira em 1 hora</li>
                </ul>
              </div>

              {email && (
                <Button 
                  onClick={resendVerificationEmail}
                  variant="outline" 
                  className="w-full"
                  disabled={status === 'verifying'}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar Email
                </Button>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 Conta Ativada!</h3>
                <p className="text-sm text-green-700">
                  Seu email foi verificado com sucesso. Sua conta está ativa e você já pode fazer login no sistema.
                </p>
              </div>

              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Fazer Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">❌ Erro na Verificação</h3>
                <p className="text-sm text-red-700 mb-3">
                  Não foi possível verificar seu email. Isso pode acontecer se:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• O link expirou (válido por 1 hora)</li>
                  <li>• O link já foi usado</li>
                  <li>• O link está corrompido</li>
                </ul>
              </div>

              <div className="space-y-2">
                {email && (
                  <Button 
                    onClick={resendVerificationEmail}
                    className="w-full"
                    disabled={status === 'verifying'}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Solicitar Novo Link
                  </Button>
                )}

                <Button 
                  onClick={() => router.push('/auth/register')}
                  variant="outline"
                  className="w-full"
                >
                  Fazer Novo Cadastro
                </Button>
              </div>
            </div>
          )}

          {/* Links de navegação */}
          <div className="text-center space-y-2 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Já tem conta verificada? Fazer login
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/landing" className="text-blue-600 hover:underline">
                ← Voltar para página inicial
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}