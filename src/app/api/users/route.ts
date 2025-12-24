import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('👥 API /api/users GET chamada')
  
  try {
    console.log('🔗 Enviando para backend: http://localhost:8003/api/users')
    
    const response = await fetch('http://localhost:8003/api/users', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📥 Backend users response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend users data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API users:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}