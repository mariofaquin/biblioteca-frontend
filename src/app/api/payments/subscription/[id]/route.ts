import { NextRequest, NextResponse } from 'next/server'

// Configuração do Asaas
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'ID da assinatura é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar assinatura no Asaas
    const response = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao buscar assinatura no Asaas:', errorData)
      return NextResponse.json(
        { success: false, error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    const subscriptionData = await response.json()

    // Buscar informações do cliente
    const customerResponse = await fetch(`${ASAAS_API_URL}/customers/${subscriptionData.customer}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      }
    })

    let customerData = null
    if (customerResponse.ok) {
      customerData = await customerResponse.json()
    }

    // Mapear dados para formato interno
    const subscription = {
      id: subscriptionData.id,
      plan: mapAsaasPlanToInternal(subscriptionData.value),
      status: subscriptionData.status,
      value: subscriptionData.value,
      nextDueDate: subscriptionData.nextDueDate,
      cycle: subscriptionData.cycle,
      description: subscriptionData.description,
      customer: customerData ? {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone
      } : null,
      createdAt: subscriptionData.dateCreated,
      updatedAt: subscriptionData.dateUpdated
    }

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Cancelar assinatura
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'ID da assinatura é obrigatório' },
        { status: 400 }
      )
    }

    // Cancelar assinatura no Asaas
    const response = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao cancelar assinatura no Asaas:', errorData)
      return NextResponse.json(
        { success: false, error: 'Erro ao cancelar assinatura' },
        { status: 500 }
      )
    }

    const cancelData = await response.json()

    // Atualizar status no banco local (se necessário)
    try {
      // UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
      // WHERE asaas_subscription_id = subscriptionId
      console.log(`Assinatura ${subscriptionId} cancelada com sucesso`)
    } catch (dbError) {
      console.error('Erro ao atualizar banco local:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      subscription: cancelData
    })

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Atualizar assinatura
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id
    const body = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'ID da assinatura é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar assinatura no Asaas
    const response = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        value: body.value,
        nextDueDate: body.nextDueDate,
        description: body.description
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao atualizar assinatura no Asaas:', errorData)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar assinatura' },
        { status: 500 }
      )
    }

    const updatedData = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Assinatura atualizada com sucesso',
      subscription: updatedData
    })

  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para mapear valor do Asaas para plano interno
function mapAsaasPlanToInternal(value: number): string {
  if (value === 0) return 'free'
  if (value === 99) return 'basic'
  if (value === 249) return 'professional'
  return 'enterprise'
}