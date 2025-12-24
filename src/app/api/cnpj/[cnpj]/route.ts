import { NextRequest, NextResponse } from 'next/server'

interface ReceitaWSResponse {
  status: string
  nome: string
  fantasia: string
  cnpj: string
  email: string
  telefone: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  situacao: string
  atividade_principal: Array<{
    code: string
    text: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cnpj: string } }
) {
  try {
    const cnpj = params.cnpj

    // Validar formato do CNPJ
    if (!cnpj || cnpj.length < 14) {
      return NextResponse.json(
        { success: false, error: 'CNPJ inválido' },
        { status: 400 }
      )
    }

    // Limpar CNPJ (remover caracteres especiais)
    const cleanCnpj = cnpj.replace(/\D/g, '')

    if (cleanCnpj.length !== 14) {
      return NextResponse.json(
        { success: false, error: 'CNPJ deve ter 14 dígitos' },
        { status: 400 }
      )
    }

    // Validar CNPJ básico (algoritmo de validação)
    if (!isValidCNPJ(cleanCnpj)) {
      return NextResponse.json(
        { success: false, error: 'CNPJ inválido' },
        { status: 400 }
      )
    }

    // Consultar API da ReceitaWS
    const receitaUrl = `https://receitaws.com.br/v1/cnpj/${cleanCnpj}`
    
    const response = await fetch(receitaUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'BiblioTech/1.0',
        'Accept': 'application/json'
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Erro na API ReceitaWS: ${response.status}`)
    }

    const data: ReceitaWSResponse = await response.json()

    // Verificar se retornou erro
    if (data.status === 'ERROR') {
      return NextResponse.json(
        { success: false, error: 'CNPJ não encontrado ou inválido' },
        { status: 404 }
      )
    }

    // Verificar se empresa está ativa
    if (data.situacao !== 'ATIVA') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Empresa com situação: ${data.situacao}`,
          warning: true,
          data: formatCompanyData(data)
        },
        { status: 200 }
      )
    }

    // Formatar dados para o formato esperado pelo frontend
    const formattedData = formatCompanyData(data)

    return NextResponse.json({
      success: true,
      data: formattedData,
      source: 'ReceitaWS'
    })

  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    
    // Verificar se é erro de timeout
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: 'Timeout na consulta do CNPJ. Tente novamente.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao consultar CNPJ. Tente novamente.' },
      { status: 500 }
    )
  }
}

function formatCompanyData(data: ReceitaWSResponse) {
  return {
    // Dados da empresa
    companyName: data.nome || '',
    fantasyName: data.fantasia || '',
    cnpj: data.cnpj || '',
    email: data.email || '',
    phone: data.telefone || '',
    
    // Endereço
    address: {
      zipCode: data.cep?.replace(/\D/g, '') || '',
      street: data.logradouro || '',
      number: data.numero || '',
      complement: data.complemento || '',
      district: data.bairro || '',
      city: data.municipio || '',
      state: data.uf || ''
    },
    
    // Informações adicionais
    status: data.situacao || '',
    mainActivity: data.atividade_principal?.[0]?.text || '',
    
    // Metadados
    lastUpdated: new Date().toISOString(),
    source: 'ReceitaWS'
  }
}

function isValidCNPJ(cnpj: string): boolean {
  // Algoritmo de validação do CNPJ
  if (cnpj.length !== 14) return false
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  // Validar primeiro dígito verificador
  let sum = 0
  let weight = 5
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(cnpj[12]) !== digit1) return false
  
  // Validar segundo dígito verificador
  sum = 0
  weight = 6
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(cnpj[13]) !== digit2) return false
  
  return true
}

// Método POST para validar múltiplos CNPJs (futuro)
export async function POST(request: NextRequest) {
  try {
    const { cnpjs }: { cnpjs: string[] } = await request.json()
    
    if (!Array.isArray(cnpjs) || cnpjs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de CNPJs é obrigatória' },
        { status: 400 }
      )
    }
    
    if (cnpjs.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Máximo 10 CNPJs por requisição' },
        { status: 400 }
      )
    }
    
    const results = []
    
    for (const cnpj of cnpjs) {
      try {
        const cleanCnpj = cnpj.replace(/\D/g, '')
        
        if (!isValidCNPJ(cleanCnpj)) {
          results.push({
            cnpj,
            success: false,
            error: 'CNPJ inválido'
          })
          continue
        }
        
        const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`)
        const data = await response.json()
        
        if (data.status === 'ERROR') {
          results.push({
            cnpj,
            success: false,
            error: 'CNPJ não encontrado'
          })
        } else {
          results.push({
            cnpj,
            success: true,
            data: formatCompanyData(data)
          })
        }
        
        // Delay entre requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        results.push({
          cnpj,
          success: false,
          error: 'Erro ao consultar CNPJ'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error) {
    console.error('Erro ao processar CNPJs:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}