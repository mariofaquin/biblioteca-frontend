import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8003'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    const companyData = cookieStore.get('company_data')?.value

    console.log('🍪 [N8N API] Cookies:', {
      hasToken: !!token,
      hasCompanyData: !!companyData,
      allCookies: cookieStore.getAll().map(c => c.name)
    })

    if (!token || !companyData) {
      return NextResponse.json(
        { error: 'Não autenticado', debug: { hasToken: !!token, hasCompanyData: !!companyData } },
        { status: 401 }
      )
    }

    const company = JSON.parse(companyData)
    const companyId = company.id

    const response = await fetch(
      `${BACKEND_URL}/api/admin/n8n/api-keys?company_id=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Erro ao buscar API Keys:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar API Keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    const companyData = cookieStore.get('company_data')?.value
    const userData = cookieStore.get('user_data')?.value

    if (!token || !companyData || !userData) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const company = JSON.parse(companyData)
    const user = JSON.parse(userData)
    const companyId = company.id

    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/admin/n8n/api-keys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
        },
        body: JSON.stringify({
          ...body,
          company_id: companyId,
          created_by: user.email,
        }),
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Erro ao criar API Key:', error)
    return NextResponse.json(
      { error: 'Erro ao criar API Key' },
      { status: 500 }
    )
  }
}
