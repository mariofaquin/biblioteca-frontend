import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔐 API /api/login POST chamada')
  
  try {
    const body = await request.text()
    console.log(`📤 Login request body: ${body}`)
    
    console.log('🔗 Enviando para backend: http://localhost:8003/api/login')
    
    const response = await fetch('http://localhost:8003/api/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body,
    })
    
    console.log(`📥 Backend login response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend login data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API login:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}