import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/biblioteca'
})

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    console.log('🔍 Verificando token de email:', token?.substring(0, 10) + '...')

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o token é válido
    const tokenResult = await pool.query(
      `SELECT at.*, u.id as user_id, u.name, u.email, u.company_id, c.name as company_name
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       JOIN companies c ON u.company_id = c.id
       WHERE at.token = $1 
         AND at.type = 'email_verification' 
         AND at.expires_at > CURRENT_TIMESTAMP 
         AND at.used = FALSE`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    const tokenData = tokenResult.rows[0]
    console.log('✅ Token válido encontrado para usuário:', tokenData.email)

    // Iniciar transação
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 1. Marcar email como verificado
      await client.query(
        `UPDATE users 
         SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [tokenData.user_id]
      )

      // 2. Marcar token como usado
      await client.query(
        `UPDATE auth_tokens 
         SET used = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE token = $1`,
        [token]
      )

      await client.query('COMMIT')
      console.log('✅ Email verificado com sucesso')

      // 3. Enviar email de boas-vindas (não bloquear response)
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        const welcomeResult = await emailService.sendWelcomeEmail(
          tokenData.email, 
          tokenData.name, 
          tokenData.company_name
        )
        
        if (welcomeResult.success) {
          console.log('📧 Email de boas-vindas enviado')
          await emailService.logAuthAction(
            tokenData.user_id, 
            tokenData.email, 
            'welcome_email_sent', 
            true, 
            { messageId: welcomeResult.messageId }
          )
        }
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
      }

      // 4. Registrar log de verificação
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        await emailService.logAuthAction(
          tokenData.user_id, 
          tokenData.email, 
          'email_verified', 
          true, 
          { verificationMethod: 'email_token' },
          request
        )
      } catch (logError) {
        console.error('⚠️ Erro ao registrar log:', logError)
      }

      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Email verificado com sucesso! Sua conta está ativa.',
        user: {
          id: tokenData.user_id,
          name: tokenData.name,
          email: tokenData.email,
          emailVerified: true
        },
        company: {
          name: tokenData.company_name
        },
        nextStep: 'login'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Erro na verificação de email:', error)

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificação via URL (quando usuário clica no link do email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=token_missing', request.url))
    }

    // Usar a mesma lógica do POST
    const verifyResponse = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' }
    }))

    const result = await verifyResponse.json()

    if (result.success) {
      return NextResponse.redirect(new URL('/auth/login?verified=true', request.url))
    } else {
      return NextResponse.redirect(new URL(`/auth/verify-email?error=${encodeURIComponent(result.error)}`, request.url))
    }

  } catch (error) {
    console.error('❌ Erro na verificação GET:', error)
    return NextResponse.redirect(new URL('/auth/verify-email?error=server_error', request.url))
  }
}