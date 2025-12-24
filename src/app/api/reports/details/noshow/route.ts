import { NextRequest, NextResponse } from 'next/server'
import { getProxyHeaders } from '@/lib/proxy-headers'

export async function GET(request: NextRequest) {
  console.log('🚫 API /api/reports/details/noshow GET chamada')
  
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // Construir URL do backend
    const backendUrl = new URL('http://localhost:8003/api/reports/details/noshow')
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
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('❌ Erro na API noshow details:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
