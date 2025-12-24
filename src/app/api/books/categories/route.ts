import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('📚 API /api/books/categories GET chamada')
  
  try {
    const backendUrl = 'http://localhost:8003/api/books/categories'
    
    // Pegar company_id do header
    const companyId = request.headers.get('x-company-id')
    
    console.log('🔗 Enviando para backend:', backendUrl)
    console.log('🏢 Company ID:', companyId)
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID é obrigatório' },
        { status: 400 }
      )
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-company-id': companyId,
      },
    })
    
    console.log(`📥 Backend categories response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend categories data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API categories GET:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
