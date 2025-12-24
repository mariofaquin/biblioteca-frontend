import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/biblioteca'
})

// Schema de validação
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Redefinindo senha com token:', body.token?.substring(0, 10) + '...')

    // Validar dados
    const { token, password } = resetPasswordSchema.parse(body)

    // Verificar se o token é válido
    const tokenResult = await pool.query(
      `SELECT at.*, u.id as user_id, u.name, u.email, u.is_active
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       WHERE at.token = $1 
         AND at.type = 'password_reset' 
         AND at.expires_at > CURRENT_TIMESTAMP 
         AND at.used = FALSE`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite uma nova recuperação de senha.' },
        { status: 400 }
      )
    }

    const tokenData = tokenResult.rows[0]
    console.log('✅ Token válido encontrado para usuário:', tokenData.email)

    // Verificar se usuário está ativo
    if (!tokenData.is_active) {
      return NextResponse.json(
        { error: 'Conta inativa. Entre em contato com o suporte.' },
        { status: 400 }
      )
    }

    // Criptografar nova senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Iniciar transação
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 1. Atualizar senha do usuário
      await client.query(
        `UPDATE users 
         SET password = $1, 
             updated_at = CURRENT_TIMESTAMP,
             login_attempts = 0,
             locked_until = NULL
         WHERE id = $2`,
        [hashedPassword, tokenData.user_id]
      )

      // 2. Marcar token como usado
      await client.query(
        `UPDATE auth_tokens 
         SET used = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE token = $1`,
        [token]
      )

      // 3. Invalidar todos os outros tokens de reset para este usuário (segurança)
      await client.query(
        `UPDATE auth_tokens 
         SET used = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND type = 'password_reset' AND used = FALSE`,
        [tokenData.user_id]
      )

      await client.query('COMMIT')
      console.log('✅ Senha redefinida com sucesso')

      // 4. Registrar log de alteração de senha
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        await emailService.logAuthAction(
          tokenData.user_id, 
          tokenData.email, 
          'password_reset_completed', 
          true, 
          { resetMethod: 'email_token' },
          request
        )
      } catch (logError) {
        console.error('⚠️ Erro ao registrar log:', logError)
      }

      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
        user: {
          id: tokenData.user_id,
          name: tokenData.name,
          email: tokenData.email
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
    console.error('❌ Erro na redefinição de senha:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar se token é válido (para mostrar formulário)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se o token é válido
    const tokenResult = await pool.query(
      `SELECT at.expires_at, u.email, u.name
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       WHERE at.token = $1 
         AND at.type = 'password_reset' 
         AND at.expires_at > CURRENT_TIMESTAMP 
         AND at.used = FALSE`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Token inválido ou expirado' 
        },
        { status: 400 }
      )
    }

    const tokenData = tokenResult.rows[0]
    const timeLeft = Math.floor((new Date(tokenData.expires_at).getTime() - Date.now()) / 1000 / 60)

    return NextResponse.json({
      valid: true,
      email: tokenData.email,
      name: tokenData.name,
      expiresIn: `${timeLeft} minutos`
    })

  } catch (error) {
    console.error('❌ Erro na verificação de token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}