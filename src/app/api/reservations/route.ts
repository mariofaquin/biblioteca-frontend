import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id obrigatório' },
        { status: 400 }
      )
    }

    // Pegar query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')
    
    // Construir URL com query params
    let url = `${BACKEND_URL}/reservations`
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    if (status) params.append('status', status)
    if (params.toString()) url += `?${params.toString()}`

    console.log('🔄 Proxy GET /api/reservations')
    console.log('🏢 Company ID:', companyId)
    console.log('📡 Backend URL:', url)

    const response = await fetch(url, {
      headers: {
        'x-company-id': companyId,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Backend error:', error)
      throw new Error(`Backend retornou ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Retornando ${data.data?.length || 0} reservas`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro no proxy /api/reservations:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()

    console.log('🔄 Proxy POST /api/reservations')
    console.log('🏢 Company ID:', companyId)

    const response = await fetch(`${BACKEND_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-company-id': companyId,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Backend error:', error)
      throw new Error(`Backend retornou ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Reserva criada')

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro no proxy POST /api/reservations:', error)
    return NextResponse.json(
      { error: 'Erro ao criar reserva' },
      { status: 500 }
    )
  }
}
