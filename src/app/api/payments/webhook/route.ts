import { NextRequest, NextResponse } from 'next/server'

// Webhook do Asaas para receber notificações de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar se é uma notificação válida do Asaas
    const event = body.event
    const payment = body.payment || body.subscription
    
    console.log('Webhook recebido:', { event, payment })

    switch (event) {
      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(payment)
        break
        
      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(payment)
        break
        
      case 'PAYMENT_DELETED':
        await handlePaymentDeleted(payment)
        break
        
      case 'SUBSCRIPTION_CREATED':
        await handleSubscriptionCreated(payment)
        break
        
      case 'SUBSCRIPTION_UPDATED':
        await handleSubscriptionUpdated(payment)
        break
        
      case 'SUBSCRIPTION_DELETED':
        await handleSubscriptionDeleted(payment)
        break
        
      default:
        console.log('Evento não tratado:', event)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

async function handlePaymentReceived(payment: any) {
  try {
    console.log('Pagamento recebido:', payment)
    
    // Aqui você atualizaria o status da assinatura no seu banco
    // Exemplo:
    // UPDATE subscriptions 
    // SET status = 'active', paid_at = NOW() 
    // WHERE asaas_subscription_id = payment.subscription
    
    // Ativar recursos do plano para o usuário
    await activateSubscription(payment.subscription, payment.customer)
    
    // Enviar email de confirmação (opcional)
    await sendConfirmationEmail(payment.customer, payment)
    
  } catch (error) {
    console.error('Erro ao processar pagamento recebido:', error)
  }
}

async function handlePaymentOverdue(payment: any) {
  try {
    console.log('Pagamento em atraso:', payment)
    
    // Atualizar status para em atraso
    // UPDATE subscriptions 
    // SET status = 'overdue' 
    // WHERE asaas_subscription_id = payment.subscription
    
    // Enviar notificação de atraso
    await sendOverdueNotification(payment.customer, payment)
    
  } catch (error) {
    console.error('Erro ao processar pagamento em atraso:', error)
  }
}

async function handlePaymentDeleted(payment: any) {
  try {
    console.log('Pagamento cancelado:', payment)
    
    // Suspender assinatura
    await suspendSubscription(payment.subscription)
    
  } catch (error) {
    console.error('Erro ao processar cancelamento:', error)
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Assinatura criada:', subscription)
    
    // Salvar assinatura no banco local
    // INSERT INTO subscriptions (asaas_subscription_id, status, created_at)
    // VALUES (subscription.id, 'pending', NOW())
    
  } catch (error) {
    console.error('Erro ao processar criação de assinatura:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Assinatura atualizada:', subscription)
    
    // Atualizar dados da assinatura
    // UPDATE subscriptions 
    // SET status = subscription.status, updated_at = NOW()
    // WHERE asaas_subscription_id = subscription.id
    
  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Assinatura cancelada:', subscription)
    
    // Cancelar assinatura
    await cancelSubscription(subscription.id)
    
  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error)
  }
}

// Funções auxiliares
async function activateSubscription(subscriptionId: string, customerId: string) {
  try {
    // Implementar lógica para ativar recursos do plano
    console.log(`Ativando assinatura ${subscriptionId} para cliente ${customerId}`)
    
    // Exemplo de ativação:
    // 1. Atualizar status no banco
    // 2. Liberar recursos do plano
    // 3. Enviar email de boas-vindas
    
  } catch (error) {
    console.error('Erro ao ativar assinatura:', error)
  }
}

async function suspendSubscription(subscriptionId: string) {
  try {
    console.log(`Suspendendo assinatura ${subscriptionId}`)
    
    // Implementar lógica para suspender recursos
    // 1. Atualizar status no banco
    // 2. Limitar acesso aos recursos
    // 3. Enviar notificação
    
  } catch (error) {
    console.error('Erro ao suspender assinatura:', error)
  }
}

async function cancelSubscription(subscriptionId: string) {
  try {
    console.log(`Cancelando assinatura ${subscriptionId}`)
    
    // Implementar lógica para cancelar
    // 1. Atualizar status no banco
    // 2. Revogar acesso
    // 3. Fazer backup dos dados
    // 4. Enviar email de cancelamento
    
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
  }
}

async function sendConfirmationEmail(customerId: string, payment: any) {
  try {
    // Implementar envio de email de confirmação
    console.log(`Enviando email de confirmação para cliente ${customerId}`)
    
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error)
  }
}

async function sendOverdueNotification(customerId: string, payment: any) {
  try {
    // Implementar envio de notificação de atraso
    console.log(`Enviando notificação de atraso para cliente ${customerId}`)
    
  } catch (error) {
    console.error('Erro ao enviar notificação de atraso:', error)
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'Webhook de pagamentos ativo',
    timestamp: new Date().toISOString(),
    events: [
      'PAYMENT_RECEIVED',
      'PAYMENT_OVERDUE', 
      'PAYMENT_DELETED',
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_UPDATED',
      'SUBSCRIPTION_DELETED'
    ]
  })
}