import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📚 API /api/books/[id] PUT chamada')
  console.log('📚 ID:', params.id)
  
  try {
    const body = await request.text()
    console.log(`📤 Books PUT request body: ${body}`)
    
    const backendUrl = `http://localhost:8003/api/books/${params.id}`
    console.log('🔗 Enviando para backend:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body,
    })
    
    console.log(`📥 Backend books PUT response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend books PUT data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API books PUT:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📚 API /api/books/[id] GET chamada')
  console.log('📚 ID:', params.id)
  
  try {
    const backendUrl = `http://localhost:8003/api/books/${params.id}`
    console.log('🔗 Enviando para backend:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📥 Backend books GET response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend books GET data: ${data}`)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📚 API /api/books/[id] DELETE chamada')
  console.log('📚 ID:', params.id)
  
  try {
    const backendUrl = `http://localhost:8003/api/books/${params.id}`
    console.log('🔗 Enviando para backend:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📥 Backend books DELETE response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend books DELETE data: ${data}`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API books DELETE:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
