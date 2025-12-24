'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  Mail,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SubscriptionData {
  id: string
  plan: string
  status: string
  nextDueDate: string
  value: number
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscription')
  
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!subscriptionId) {
      setError('ID da assinatura não encontrado')
      setLoading(false)
      return
    }

    // Verificar status da assinatura
    checkSubscriptionStatus()
  }, [subscriptionId])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/payments/subscription/${subscriptionId}`)
      const data = await response.json()

      if (data.success) {
        setSubscription(data.subscription)
      } else {
        setError(data.error || 'Erro ao verificar assinatura')
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      setError('Erro ao verificar status da assinatura')
    } finally {
      setLoading(false)
    }
  }

  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      basic: 'Básico',
      professional: 'Profissional',
      enterprise: 'Enterprise'
    }
    return plans[planId] || planId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando pagamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Erro na Verificação
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/landing">Voltar ao Início</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="mailto:suporte@bibliotech.com">Contatar Suporte</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BiblioTech</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Sucesso */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pagamento Confirmado!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Sua assinatura foi ativada com sucesso
            </p>
            <Badge className="bg-green-600 text-white">
              Plano {subscription ? getPlanName(subscription.plan) : 'Ativo'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Detalhes da Assinatura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Detalhes da Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plano:</span>
                      <span className="font-semibold">{getPlanName(subscription.plan)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-semibold">{formatCurrency(subscription.value)}/mês</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-600">Ativo</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próxima cobrança:</span>
                      <span className="font-semibold">{formatDate(subscription.nextDueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID da Assinatura:</span>
                      <span className="font-mono text-sm">{subscription.id}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Próximos Passos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Acesse sua conta</p>
                      <p className="text-sm text-gray-600">Faça login para começar a usar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Configure sua biblioteca</p>
                      <p className="text-sm text-gray-600">Adicione livros e usuários</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Explore os recursos</p>
                      <p className="text-sm text-gray-600">Descubra todas as funcionalidades</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações Importantes */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📧 Confirmação por Email</h4>
                  <p className="text-sm text-gray-600">
                    Você receberá um email de confirmação com todos os detalhes da sua assinatura 
                    e instruções para começar.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🔄 Cobrança Automática</h4>
                  <p className="text-sm text-gray-600">
                    Sua assinatura será renovada automaticamente todo mês. 
                    Você pode cancelar a qualquer momento.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">💬 Suporte</h4>
                  <p className="text-sm text-gray-600">
                    Nossa equipe está disponível para ajudar você a configurar 
                    e usar o sistema da melhor forma.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">📱 Acesso Mobile</h4>
                  <p className="text-sm text-gray-600">
                    Instale nosso PWA no seu celular para ter acesso rápido 
                    e funcionalidades offline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button size="lg" asChild>
              <Link href="/login">
                <ArrowRight className="h-5 w-5 mr-2" />
                Acessar Sistema
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <Link href="mailto:suporte@bibliotech.com">
                <Mail className="h-5 w-5 mr-2" />
                Falar com Suporte
              </Link>
            </Button>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500">
              Obrigado por escolher a BiblioTech! 🎉
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Se você tiver alguma dúvida, não hesite em nos contatar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}