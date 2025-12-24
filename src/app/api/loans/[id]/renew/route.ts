import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🔄 API /api/loans/${params.id}/renew PUT chamada`)
  
  try {
    const body = await request.text()
    console.log(`📤 Request body: ${body}`)
    
    const backendUrl = `http://localhost:8003/api/loans/${params.id}/renew`
    console.log(`🔗 Redirecionando para: ${backendUrl}`)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body,
    })
    
    console.log(`📥 Backend response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API loans renew PUT:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
