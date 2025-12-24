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

    const response = await fetch(`${BACKEND_URL}/reports/details/reservations`, {
      headers: {
        'x-company-id': companyId,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend retornou ${response.status}`)
    }

    const data = await response.json()
    
    // Mapear dados do backend para o formato esperado pelo componente
    const mappedData = data.map((item: any) => ({
      id: item.id?.toString() || '',
      userName: item.name || '',
      userEmail: item.email || '',
      userPhone: item.phone || '',
      userAddress: item.address || '',
      userRegistration: item.user_created_at || item.reserved_at,
      bookTitle: item.book_title || '',
      bookAuthor: item.author || '',
      bookISBN: item.isbn || '',
      bookCategory: item.category || '',
      bookPages: item.pages || 0,
      bookYear: item.year || 0,
      bookDescription: item.description || '',
      daysWaiting: item.days_waiting || 0,
      reservationDate: item.reserved_at,
      position: item.position || 1,
      status: item.status || 'waiting'
    }))

    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Erro ao buscar detalhes de reservas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes de reservas' },
      { status: 500 }
    )
  }
}
