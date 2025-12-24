import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 API route /api/test chamada')
  
  try {
    // Testar conexão direta com o backend
    const backendResponse = await fetch('http://localhost:8003/api/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    console.log(`🔗 Backend response: ${backendResponse.status}`)
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend funcionando:', data)
      
      return NextResponse.json({
        success: true,
        message: 'API route funcionando e backend acessível',
        backend_data: data,
        timestamp: new Date().toISOString()
      })
    } else {
      console.log('❌ Backend não responde')
      return NextResponse.json({
        success: false,
        message: 'API route funcionando mas backend não responde',
        backend_status: backendResponse.status,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com backend:', error)
    return NextResponse.json({
      success: false,
      message: 'API route funcionando mas erro ao conectar com backend',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}