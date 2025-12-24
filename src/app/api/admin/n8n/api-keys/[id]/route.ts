import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8003'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    const companyData = cookieStore.get('company_data')?.value

    if (!token || !companyData) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const company = JSON.parse(companyData)
    const companyId = company.id

    const response = await fetch(
      `${BACKEND_URL}/api/admin/n8n/api-keys/${params.id}?company_id=${companyId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Erro ao revogar API Key:', error)
    return NextResponse.json(
      { error: 'Erro ao revogar API Key' },
      { status: 500 }
    )
  }
}
