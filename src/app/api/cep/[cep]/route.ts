import { NextRequest, NextResponse } from 'next/server'

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const cep = params.cep

    // Validar formato do CEP
    if (!cep || cep.length < 8) {
      return NextResponse.json(
        { success: false, error: 'CEP inválido' },
        { status: 400 }
      )
    }

    // Limpar CEP (remover caracteres especiais)
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { success: false, error: 'CEP deve ter 8 dígitos' },
        { status: 400 }
      )
    }

    // Validar CEP básico (não pode ser 00000000)
    if (cleanCep === '00000000') {
      return NextResponse.json(
        { success: false, error: 'CEP inválido' },
        { status: 400 }
      )
    }

    // Consultar API do ViaCEP
    const viaCepUrl = `https://viacep.com.br/ws/${cleanCep}/json/`
    
    const response = await fetch(viaCepUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'BiblioTech/1.0',
        'Accept': 'application/json'
      },
      // Timeout de 8 segundos
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`Erro na API ViaCEP: ${response.status}`)
    }

    const data: ViaCEPResponse = await response.json()

    // Verificar se retornou erro
    if (data.erro) {
      return NextResponse.json(
        { success: false, error: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    // Formatar dados para o formato esperado pelo frontend
    const formattedData = formatAddressData(data)

    return NextResponse.json({
      success: true,
      data: formattedData,
      source: 'ViaCEP'
    })

  } catch (error) {
    console.error('Erro ao consultar CEP:', error)
    
    // Verificar se é erro de timeout
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: 'Timeout na consulta do CEP. Tente novamente.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao consultar CEP. Tente novamente.' },
      { status: 500 }
    )
  }
}

function formatAddressData(data: ViaCEPResponse) {
  return {
    // Endereço formatado
    address: {
      zipCode: data.cep?.replace(/\D/g, '') || '',
      street: data.logradouro || '',
      complement: data.complemento || '',
      district: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || ''
    },
    
    // Informações adicionais
    ibge: data.ibge || '',
    ddd: data.ddd || '',
    
    // Metadados
    lastUpdated: new Date().toISOString(),
    source: 'ViaCEP'
  }
}

// Método POST para validar múltiplos CEPs (futuro)
export async function POST(request: NextRequest) {
  try {
    const { ceps }: { ceps: string[] } = await request.json()
    
    if (!Array.isArray(ceps) || ceps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de CEPs é obrigatória' },
        { status: 400 }
      )
    }
    
    if (ceps.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Máximo 10 CEPs por requisição' },
        { status: 400 }
      )
    }
    
    const results = []
    
    for (const cep of ceps) {
      try {
        const cleanCep = cep.replace(/\D/g, '')
        
        if (cleanCep.length !== 8) {
          results.push({
            cep,
            success: false,
            error: 'CEP deve ter 8 dígitos'
          })
          continue
        }
        
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()
        
        if (data.erro) {
          results.push({
            cep,
            success: false,
            error: 'CEP não encontrado'
          })
        } else {
          results.push({
            cep,
            success: true,
            data: formatAddressData(data)
          })
        }
        
        // Delay entre requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        results.push({
          cep,
          success: false,
          error: 'Erro ao consultar CEP'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error) {
    console.error('Erro ao processar CEPs:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}