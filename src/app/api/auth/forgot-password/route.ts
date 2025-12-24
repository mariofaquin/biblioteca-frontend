import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { z } from 'zod'

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/biblioteca'
})

// Schema de validação
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Solicitação de recuperação de senha para:', body.email)

    // Validar dados
    const { email } = forgotPasswordSchema.parse(body)

    // Verificar se usuário existe e está ativo
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.is_active, u.email_verified, c.name as company_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1`,
      [email]
    )

    // Sempre retornar sucesso por segurança (não revelar se email existe)
    if (userResult.rows.length === 0) {
      console.log('⚠️ Email não encontrado, mas retornando sucesso por segurança')
      return NextResponse.json({
        success: true,
        message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.'
      })
    }

    const user = userResult.rows[0]

    // Verificar se usuário está ativo
    if (!user.is_active) {
      console.log('⚠️ Usuário inativo, mas retornando sucesso por segurança')
      return NextResponse.json({
        success: true,
        message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.'
      })
    }

    // Verificar se email foi verificado
    if (!user.email_verified) {
      console.log('⚠️ Email não verificado')
      return NextResponse.json({
        error: 'Email não verificado. Verifique seu email primeiro ou solicite um novo link de verificação.'
      }, { status: 400 })
    }

    console.log('✅ Usuário válido encontrado:', user.name)

    // Gerar token de recuperação
    const crypto = require('crypto')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

    // Salvar token no banco
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token, type, expires_at) 
       VALUES ($1, $2, 'password_reset', $3)`,
      [user.id, resetToken, expiresAt]
    )

    console.log('🔑 Token de recuperação gerado')

    // Enviar email de recuperação (não bloquear response)
    try {
      const emailService = require('../../../../../backend-node/lib/email-service')
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email, 
        user.name, 
        resetToken
      )
      
      if (emailResult.success) {
        console.log('📧 Email de recuperação enviado com sucesso')
        await emailService.logAuthAction(
          user.id, 
          user.email, 
          'password_reset_requested', 
          true, 
          { messageId: emailResult.messageId },
          request
        )
      } else {
        console.log('⚠️ Falha ao enviar email:', emailResult.message)
        await emailService.logAuthAction(
          user.id, 
          user.email, 
          'password_reset_email_failed', 
          false, 
          { error: emailResult.message },
          request
        )
      }
    } catch (emailError) {
      console.error('❌ Erro no serviço de email:', emailError)
    }

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação em alguns minutos.',
      details: 'Verifique sua caixa de entrada e spam. O link expira em 30 minutos.'
    })

  } catch (error) {
    console.error('❌ Erro na recuperação de senha:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email inválido', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}