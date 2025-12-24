import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/biblioteca'
})

// Schema de validação
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  planType: z.enum(['free', 'basic', 'professional', 'enterprise']).default('free')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Dados recebidos para registro:', { ...body, password: '[HIDDEN]' })

    // Validar dados
    const validatedData = registerSchema.parse(body)
    const { name, email, password, companyName, phone, planType } = validatedData

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se empresa já existe
    const existingCompany = await pool.query(
      'SELECT id FROM companies WHERE name = $1',
      [companyName]
    )

    if (existingCompany.rows.length > 0) {
      return NextResponse.json(
        { error: 'Uma empresa com este nome já existe' },
        { status: 400 }
      )
    }

    // Criptografar senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Iniciar transação
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 1. Criar empresa
      const companyResult = await client.query(
        `INSERT INTO companies (name, email, phone, created_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
         RETURNING id, name`,
        [companyName, email, phone || null]
      )
      
      const company = companyResult.rows[0]
      console.log('🏢 Empresa criada:', company)

      // 2. Criar usuário (admin da empresa, email não verificado)
      const userResult = await client.query(
        `INSERT INTO users (name, email, password, role, company_id, is_active, email_verified, created_at) 
         VALUES ($1, $2, $3, 'admin', $4, true, false, CURRENT_TIMESTAMP) 
         RETURNING id, name, email, role`,
        [name, email, hashedPassword, company.id]
      )
      
      const user = userResult.rows[0]
      console.log('👤 Usuário criado:', { ...user, password: '[HIDDEN]' })

      // 3. Criar relacionamento user_companies
      await client.query(
        `INSERT INTO user_companies (user_id, company_id, created_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [user.id, company.id]
      )

      // 4. Criar assinatura (plano gratuito por padrão)
      const subscriptionResult = await client.query(
        `INSERT INTO subscriptions (company_id, plan_type, status, created_at) 
         VALUES ($1, $2, 'active', CURRENT_TIMESTAMP) 
         RETURNING id`,
        [company.id, planType]
      )

      console.log('💳 Assinatura criada:', subscriptionResult.rows[0])

      // 5. Gerar token de verificação de email
      const crypto = require('crypto')
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      await client.query(
        `INSERT INTO auth_tokens (user_id, token, type, expires_at) 
         VALUES ($1, $2, 'email_verification', $3)`,
        [user.id, verificationToken, expiresAt]
      )

      await client.query('COMMIT')
      console.log('✅ Transação concluída com sucesso')

      // 6. Enviar email de verificação (não bloquear o response)
      try {
        const emailService = require('../../../../../backend-node/lib/email-service')
        const emailResult = await emailService.sendVerificationEmail(email, name, verificationToken)
        
        if (emailResult.success) {
          console.log('📧 Email de verificação enviado com sucesso')
          await emailService.logAuthAction(user.id, email, 'email_verification_sent', true, { messageId: emailResult.messageId })
        } else {
          console.log('⚠️ Falha ao enviar email:', emailResult.message)
          await emailService.logAuthAction(user.id, email, 'email_verification_failed', false, { error: emailResult.message })
        }
      } catch (emailError) {
        console.error('❌ Erro no serviço de email:', emailError)
      }

      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso! Verifique seu email para ativar a conta.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: false
        },
        company: {
          id: company.id,
          name: company.name
        },
        nextStep: 'verify_email'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Erro no registro:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if ((error as any).code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Email ou nome da empresa já existe' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}