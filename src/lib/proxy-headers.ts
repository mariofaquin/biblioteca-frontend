import { NextRequest } from 'next/server'

/**
 * Extrai headers importantes da requisição do Next.js para repassar ao backend
 * Inclui x-company-id que é essencial para isolamento de dados
 */
export function getProxyHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  
  // Extrair x-company-id
  const companyId = request.headers.get('x-company-id')
  if (companyId) {
    headers['x-company-id'] = companyId
    console.log(`✅ Header x-company-id repassado: ${companyId}`)
  } else {
    console.warn('⚠️ Header x-company-id não encontrado na requisição')
  }
  
  // Extrair Authorization se presente
  const authorization = request.headers.get('authorization')
  if (authorization) {
    headers['Authorization'] = authorization
  }
  
  return headers
}
