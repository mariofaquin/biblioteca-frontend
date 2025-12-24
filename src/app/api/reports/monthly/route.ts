import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'last-6-months'
    
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id obrigatório' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/reports/monthly?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro no proxy /api/reports/monthly:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados mensais: ' + error.message },
      { status: 500 }
    )
  }
}
