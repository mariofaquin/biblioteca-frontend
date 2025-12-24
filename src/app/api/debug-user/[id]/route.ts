import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🔍 Debug user: ${params.id}`)
  
  try {
    // Buscar usuário específico
    const userResponse = await fetch(`http://localhost:8003/api/users`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!userResponse.ok) {
      return NextResponse.json({
        error: 'Erro ao buscar usuários',
        status: userResponse.status
      }, { status: 500 })
    }
    
    const usersData = await userResponse.json()
    const users = usersData.data || []
    
    // Encontrar o usuário específico
    const user = users.find((u: any) => u.id === params.id)
    
    if (!user) {
      return NextResponse.json({
        found: false,
        searched_id: params.id,
        total_users: users.length,
        available_users: users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company_id: u.company_id
        }))
      })
    }
    
    // Buscar informações da empresa se existir
    let companyInfo = null
    if (user.company_id) {
      try {
        const companyResponse = await fetch(`http://localhost:8003/api/companies`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (companyResponse.ok) {
          const companiesData = await companyResponse.json()
          const companies = companiesData.data || []
          companyInfo = companies.find((c: any) => c.id === user.company_id)
        }
      } catch (error) {
        console.log('Erro ao buscar empresa:', error)
      }
    }
    
    return NextResponse.json({
      found: true,
      user: user,
      company: companyInfo,
      debug_info: {
        user_has_company_id: !!user.company_id,
        company_exists: !!companyInfo,
        total_users_in_system: users.length
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no debug user:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}