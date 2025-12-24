import { NextRequest, NextResponse } from 'next/server'
import { getProxyHeaders } from '@/lib/proxy-headers'

export async function GET(request: NextRequest) {
  console.log('🔄 API /api/loans GET chamada')
  
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // Construir URL do backend
    const backendUrl = new URL('http://localhost:8003/api/loans')
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })
    
    console.log(`🔗 Redirecionando para: ${backendUrl.toString()}`)
    
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: getProxyHeaders(request),
    })
    
    console.log(`📥 Backend response: ${response.status}`)
    
    const data = await response.text()
    console.log(`📄 Backend data: ${data.substring(0, 200)}...`)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API loans GET:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔄 API /api/loans POST chamada')
  
  try {
    const body = await request.text()
    console.log(`📤 Request body: ${body}`)
    console.log('🔗 Enviando para backend: http://localhost:8003/api/loans')
    
    const response = await fetch('http://localhost:8003/api/loans', {
      method: 'POST',
      headers: getProxyHeaders(request),
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
    console.error('❌ Erro na API loans POST:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}