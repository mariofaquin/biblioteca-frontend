import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🏢 API /api/companies GET chamada')
  
  try {
    console.log('🔗 Enviando para backend: http://localhost:8003/api/companies')
    
    const response = await fetch('http://localhost:8003/api/companies', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store'
    })
    
    console.log(`📥 Backend companies response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend companies data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API companies:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}