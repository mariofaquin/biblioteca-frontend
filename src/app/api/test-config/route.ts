import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const config = {
      asaas_api_url: process.env.ASAAS_API_URL || 'NOT_SET',
      asaas_api_key_exists: !!process.env.ASAAS_API_KEY,
      asaas_api_key_length: process.env.ASAAS_API_KEY?.length || 0,
      asaas_api_key_prefix: process.env.ASAAS_API_KEY?.substring(0, 20) || 'NOT_SET',
      node_env: process.env.NODE_ENV || 'NOT_SET',
      all_env_keys: Object.keys(process.env).filter(key => key.includes('ASAAS'))
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração verificada',
      config,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}