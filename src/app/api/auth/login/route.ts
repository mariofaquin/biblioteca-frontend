import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/biblioteca'
})

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Configurações de segurança
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Tentativa de login para:', body.email)

    // Validar dados
    const { email, password } = loginSchema.parse(body)

    // Buscar usuário com informações da empresa
    const userResult = await pool.query(
      `SELECT 
         u.id, u.name, u.email, u.password, u.role, u.is_active, 
         u.email_verified, u.login_attempts, u.locked_until,
         u.company_id, c.name as company_name,
         s.plan_type, s.status as subscription_status
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
       WHERE u.email = $1`,
      [email]
    )

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado')
      
      // Log da tentativa falhada
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        await emailService.logAuthAction(
          null, 
          email, 
          'login_failed', 
          false, 
          { reason: 'user_not_found' },
          request
        )
      } catch (logError) {
        console.error('⚠️ Erro ao registrar log:', logError)
      }

      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const user = userResult.rows[0]

    // Verificar se conta está bloqueada
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const timeLeft = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000 / 60)
      console.log('🔒 Conta bloqueada por mais', timeLeft, 'minutos')
      
      return NextResponse.json(
        { 
          error: `Conta temporariamente bloqueada. Tente novamente em ${timeLeft} minutos.`,
          locked: true,
          timeLeft: timeLeft
        },
        { status: 423 }
      )
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      console.log('❌ Usuário inativo')
      return NextResponse.json(
        { error: 'Conta inativa. Entre em contato com o suporte.' },
        { status: 401 }
      )
    }

    // Verificar se email foi verificado
    if (!user.email_verified) {
      console.log('❌ Email não verificado')
      return NextResponse.json(
        { 
          error: 'Email não verificado. Verifique sua caixa de entrada ou solicite um novo link.',
          emailVerified: false,
          nextStep: 'verify_email'
        },
        { status: 401 }
      )
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      console.log('❌ Senha incorreta')
      
      // Incrementar tentativas de login
      const newAttempts = (user.login_attempts || 0) + 1
      let lockUntil = null
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCKOUT_DURATION)
        console.log('🔒 Conta bloqueada após', newAttempts, 'tentativas')
      }

      await pool.query(
        `UPDATE users 
         SET login_attempts = $1, locked_until = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [newAttempts, lockUntil, user.id]
      )

      // Log da tentativa falhada
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        await emailService.logAuthAction(
          user.id, 
          email, 
          'login_failed', 
          false, 
          { 
            reason: 'wrong_password', 
            attempts: newAttempts,
            locked: !!lockUntil
          },
          request
        )
      } catch (logError) {
        console.error('⚠️ Erro ao registrar log:', logError)
      }

      if (lockUntil) {
        return NextResponse.json(
          { 
            error: `Muitas tentativas falhadas. Conta bloqueada por ${LOCKOUT_DURATION / 60000} minutos.`,
            locked: true
          },
          { status: 423 }
        )
      }

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts
      return NextResponse.json(
        { 
          error: `Email ou senha incorretos. ${attemptsLeft} tentativas restantes.`,
          attemptsLeft: attemptsLeft
        },
        { status: 401 }
      )
    }

    // Login bem-sucedido - resetar tentativas
    await pool.query(
      `UPDATE users 
       SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    )

    console.log('✅ Login realizado com sucesso para:', user.name)

    // Log do login bem-sucedido
    try {
      const emailService = require('../../../../../backend-node/lib/email-service')
      await emailService.logAuthAction(
        user.id, 
        email, 
        'login_success', 
        true, 
        { 
          company_id: user.company_id,
          role: user.role
        },
        request
      )
    } catch (logError) {
      console.error('⚠️ Erro ao registrar log:', logError)
    }

    // Preparar dados do usuário para retorno
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified,
      company: {
        id: user.company_id,
        name: user.company_name
      },
      subscription: {
        planType: user.plan_type || 'free',
        status: user.subscription_status || 'active'
      }
    }

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: userData,
      nextStep: 'dashboard'
    })

  } catch (error) {
    console.error('❌ Erro no login:', error)

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