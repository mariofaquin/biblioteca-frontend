import { NextRequest, NextResponse } from 'next/server'

// Configuração do Asaas
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
// Temporário: API Key hardcoded para teste
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1NjVmNGI1LWMxMTAtNDE2ZS05YjdiLTJmZDMzZDg0ZDQzNDo6JGFhY2hfY2JkODk4ZDQtYWEyZS00MzdlLWE4M2EtNzBjNTBiODBjODk5'

interface CustomerData {
  name: string
  email: string
  phone: string
  document: string
  companyName?: string
  address: {
    zipCode: string
    street: string
    number: string
    complement?: string
    district: string
    city: string
    state: string
  }
}

interface PlanConfig {
  id: string
  name: string
  value: number
  cycle: 'MONTHLY' | 'YEARLY'
  description: string
}

const plans: Record<string, PlanConfig> = {
  basic: {
    id: 'basic',
    name: 'Plano Básico',
    value: 99.00,
    cycle: 'MONTHLY',
    description: 'Plano básico para pequenas bibliotecas'
  },
  professional: {
    id: 'professional',
    name: 'Plano Profissional',
    value: 249.00,
    cycle: 'MONTHLY',
    description: 'Plano profissional para bibliotecas em crescimento'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { plan, customer }: { plan: string; customer: CustomerData } = await request.json()

    // Debug: Log das variáveis de ambiente
    console.log('🔍 DEBUG - Variáveis de ambiente:')
    console.log('ASAAS_API_URL:', ASAAS_API_URL)
    console.log('ASAAS_API_KEY existe:', !!ASAAS_API_KEY)
    console.log('ASAAS_API_KEY length:', ASAAS_API_KEY?.length || 0)
    console.log('ASAAS_API_KEY prefix:', ASAAS_API_KEY?.substring(0, 20) || 'VAZIO')

    // Validar plano
    if (!plans[plan]) {
      return NextResponse.json(
        { success: false, error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const selectedPlan = plans[plan]

    // Validar dados obrigatórios
    if (!customer.name || !customer.email || !customer.phone || !customer.document) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validar se API Key está configurada
    if (!ASAAS_API_KEY || ASAAS_API_KEY.length < 50) {
      console.error('❌ API Key do Asaas não configurada ou inválida')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuração de pagamento inválida',
          debug: {
            api_key_exists: !!ASAAS_API_KEY,
            api_key_length: ASAAS_API_KEY?.length || 0,
            api_key_prefix: ASAAS_API_KEY?.substring(0, 20) || 'VAZIO'
          }
        },
        { status: 500 }
      )
    }

    // 1. Criar cliente no Asaas
    console.log('🚀 Criando cliente no Asaas...')
    const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        phone: customer.phone.replace(/\D/g, ''), // Remove formatação
        cpfCnpj: customer.document.replace(/\D/g, ''), // Remove formatação
        companyName: customer.companyName || undefined,
        postalCode: customer.address.zipCode.replace(/\D/g, ''),
        address: customer.address.street,
        addressNumber: customer.address.number,
        complement: customer.address.complement || undefined,
        province: customer.address.district,
        city: customer.address.city,
        state: customer.address.state.toUpperCase(),
        country: 'Brasil',
        externalReference: `bibliotech_${Date.now()}` // Referência única
      })
    })

    if (!customerResponse.ok) {
      const errorData = await customerResponse.json()
      console.error('❌ Erro ao criar cliente no Asaas:')
      console.error('Status:', customerResponse.status)
      console.error('StatusText:', customerResponse.statusText)
      console.error('Headers enviados:', {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY ? `${ASAAS_API_KEY.substring(0, 20)}...` : 'VAZIO'
      })
      console.error('Erro completo:', errorData)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar cliente',
          details: errorData,
          debug: {
            api_key_exists: !!ASAAS_API_KEY,
            api_key_length: ASAAS_API_KEY?.length || 0,
            api_url: ASAAS_API_URL
          }
        },
        { status: 500 }
      )
    }

    const customerData = await customerResponse.json()
    const customerId = customerData.id

    // 2. Criar assinatura no Asaas
    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'CREDIT_CARD', // Cartão de crédito como padrão
        value: selectedPlan.value,
        nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        cycle: selectedPlan.cycle,
        description: selectedPlan.description,
        externalReference: `bibliotech_subscription_${plan}_${Date.now()}`,
        // Configurações da assinatura
        maxPayments: null, // Ilimitado
        endDate: null, // Sem data de fim
        // Webhook para notificações - removido temporariamente
        // callback: {
        //   successUrl: `http://localhost:3000/payment/success`,
        //   autoRedirect: true
        // }
      })
    })

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json()
      console.error('Erro ao criar assinatura no Asaas:', errorData)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar assinatura' },
        { status: 500 }
      )
    }

    const subscriptionData = await subscriptionResponse.json()

    // 3. Gerar link de pagamento
    const paymentLinkResponse = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: `${selectedPlan.name} - BiblioTech`,
        description: selectedPlan.description,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Válido por 7 dias
        value: selectedPlan.value,
        billingType: 'CREDIT_CARD',
        chargeType: 'RECURRENT',
        subscriptionId: subscriptionData.id,
        // URLs de callback - removido temporariamente
        // callback: {
        //   successUrl: `http://localhost:3000/payment/success?subscription=${subscriptionData.id}`,
        //   autoRedirect: true
        // }
      })
    })

    if (!paymentLinkResponse.ok) {
      const errorData = await paymentLinkResponse.json()
      console.error('Erro ao criar link de pagamento:', errorData)
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar link de pagamento' },
        { status: 500 }
      )
    }

    const paymentLinkData = await paymentLinkResponse.json()

    // 4. Salvar dados no banco local (opcional - para controle interno)
    try {
      // Aqui você pode salvar os dados da assinatura no seu banco PostgreSQL
      // para controle interno e sincronização
      
      // Exemplo de estrutura:
      // INSERT INTO subscriptions (
      //   asaas_customer_id, 
      //   asaas_subscription_id, 
      //   plan_type, 
      //   status, 
      //   created_at
      // ) VALUES (?, ?, ?, 'pending', NOW())
      
      console.log('Assinatura criada:', {
        customerId,
        subscriptionId: subscriptionData.id,
        plan: selectedPlan.id,
        value: selectedPlan.value
      })
    } catch (dbError) {
      console.error('Erro ao salvar no banco local:', dbError)
      // Não falhar a operação por erro no banco local
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentLinkData.url,
      subscriptionId: subscriptionData.id,
      customerId: customerId,
      plan: selectedPlan
    })

  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Método GET para verificar status da API
export async function GET() {
  return NextResponse.json({
    message: 'API de pagamentos ativa',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}