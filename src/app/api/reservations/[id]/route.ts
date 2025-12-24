import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🔄 API /api/reservations/${params.id} DELETE chamada`)
  
  try {
    const backendUrl = `http://localhost:8003/api/reservations/${params.id}`
    console.log(`🔗 Redirecionando para: ${backendUrl}`)
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
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
    console.error('❌ Erro na API reservations DELETE:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
