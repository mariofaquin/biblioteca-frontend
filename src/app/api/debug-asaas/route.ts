import { NextRequest, NextResponse } from 'next/server'

// API Key hardcoded para teste
const ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'
const ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1NjVmNGI1LWMxMTAtNDE2ZS05YjdiLTJmZDMzZDg0ZDQzNDo6JGFhY2hfY2JkODk4ZDQtYWEyZS00MzdlLWE4M2EtNzBjNTBiODBjODk5'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let debug = {
      step: '',
      success: false,
      data: null as any,
      error: null as string | null,
      api_key_info: {
        exists: !!ASAAS_API_KEY,
        length: ASAAS_API_KEY.length,
        prefix: ASAAS_API_KEY.substring(0, 20)
      }
    }

    // Passo 1: Testar conexão básica com Asaas
    debug.step = 'Testando conexão com Asaas'
    
    try {
      const testResponse = await fetch(`${ASAAS_API_URL}/customers?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY
        }
      })

      if (!testResponse.ok) {
        const errorData = await testResponse.text()
        debug.error = `Erro na conexão: ${testResponse.status} - ${errorData}`
        return NextResponse.json(debug, { status: 500 })
      }

      const testData = await testResponse.json()
      debug.data = { connection_test: 'OK', customers_found: testData.totalCount || 0 }
      
    } catch (error) {
      debug.error = `Erro de rede: ${error instanceof Error ? error.message : 'Desconhecido'}`
      return NextResponse.json(debug, { status: 500 })
    }

    // Passo 2: Criar cliente simples
    debug.step = 'Criando cliente no Asaas'
    
    const customerData = {
      name: body.customer?.name || 'Teste Debug',
      email: body.customer?.email || 'debug@teste.com',
      phone: '11999999999',
      cpfCnpj: '12345678901'
    }

    try {
      const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify(customerData)
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        debug.error = `Erro ao criar cliente: ${customerResponse.status} - ${JSON.stringify(errorData)}`
        return NextResponse.json(debug, { status: 500 })
      }

      const customer = await customerResponse.json()
      debug.data = { ...debug.data, customer_created: customer.id, customer_name: customer.name }

    } catch (error) {
      debug.error = `Erro na criação do cliente: ${error instanceof Error ? error.message : 'Desconhecido'}`
      return NextResponse.json(debug, { status: 500 })
    }

    // Passo 3: Sucesso
    debug.step = 'Teste completo'
    debug.success = true
    
    return NextResponse.json({
      success: true,
      message: 'Debug concluído com sucesso!',
      debug,
      next_steps: [
        'Conexão com Asaas: OK',
        'Criação de cliente: OK',
        'API Key funcionando corretamente',
        'Pronto para implementar assinaturas'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      step: 'Erro geral'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Debug Asaas',
    instructions: 'Use POST com dados do cliente para testar',
    api_key_configured: !!ASAAS_API_KEY,
    api_key_length: ASAAS_API_KEY.length
  })
}