import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('📚 API /api/books GET chamada')
  
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const backendUrl = `http://localhost:8003/api/books${searchParams ? `?${searchParams}` : ''}`
    
    // Pegar company_id do header
    const companyId = request.headers.get('x-company-id')
    
    console.log('🔗 Enviando para backend:', backendUrl)
    console.log('🏢 Company ID:', companyId)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-company-id': companyId || '',
      },
    })
    
    console.log(`📥 Backend books response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend books data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API books GET:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('📚 API /api/books POST chamada')
  
  try {
    const body = await request.text()
    console.log(`📤 Books request body: ${body}`)
    
    console.log('🔗 Enviando para backend: http://localhost:8003/api/books')
    
    const response = await fetch('http://localhost:8003/api/books', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body,
    })
    
    console.log(`📥 Backend books POST response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend books POST data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API books POST:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}