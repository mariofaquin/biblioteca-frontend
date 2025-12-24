// Sistema de autenticação seguro
import { createHash } from 'crypto'

// Função para hash de senhas (simulação - em produção usar bcrypt)
export function hashPassword(password: string): string {
  // Em produção, usar bcrypt ou similar
  return createHash('sha256').update(password + 'salt_secreto').digest('hex')
}

// Função para verificar senha
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Função para mascarar email
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  const maskedUsername = username.substring(0, 2) + '***'
  const [domainName, extension] = domain.split('.')
  const maskedDomain = domainName.substring(0, 1) + '***'
  return `${maskedUsername}@${maskedDomain}.${extension}`
}

// Função para mascarar senha
export function maskPassword(password: string): string {
  return password.substring(0, 1) + '***' + password.substring(password.length - 1)
}

// Usuários com senhas hasheadas (não em texto plano)
export const SECURE_USERS = [
  {
    id: 'ff297ab5-e1fe-4c63-8250-3986ceba314f',
    email: 'root@biblioteca.com',
    // Hash de 'password' - EM PRODUÇÃO USAR BCRYPT!
    passwordHash: hashPassword('password'),
    name: 'Root User',
    role: 'root',
    is_root: true
  },
  {
    id: 'd4d6169c-ad59-4119-9851-cc4a53de0db1',
    email: 'admin@demo.com',
    passwordHash: hashPassword('password'),
    name: 'Admin Demo',
    role: 'admin',
    is_root: false,
    has_multiple_companies: true,
    companies: [
      { id: 'comp1', name: 'Biblioteca Central', slug: 'biblioteca-central' },
      { id: 'comp2', name: 'Biblioteca Norte', slug: 'biblioteca-norte' }
    ]
  },
  {
    id: '4223ef67-04e6-4aa7-8816-f3934ee1772c',
    email: 'user@demo.com',
    passwordHash: hashPassword('password'),
    name: 'Usuário Demo',
    role: 'user',
    is_root: false
  }
]

// Função segura de autenticação
export function authenticateUser(email: string, password: string) {
  // NUNCA logar senhas ou dados sensíveis
  console.log('🔐 Tentativa de autenticação para:', maskEmail(email))
  
  const user = SECURE_USERS.find(u => u.email === email)
  
  if (!user) {
    console.log('❌ Usuário não encontrado')
    return null
  }
  
  if (!verifyPassword(password, user.passwordHash)) {
    console.log('❌ Senha incorreta')
    return null
  }
  
  console.log('✅ Autenticação bem-sucedida')
  
  // Retornar dados do usuário SEM a senha
  const { passwordHash, ...safeUserData } = user
  return safeUserData
}

// Função para logs seguros
export function secureLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      // Remover dados sensíveis antes de logar
      const safeData = { ...data }
      if (safeData.password) delete safeData.password
      if (safeData.passwordHash) delete safeData.passwordHash
      if (safeData.email) safeData.email = maskEmail(safeData.email)
      
      console.log(message, safeData)
    } else {
      console.log(message)
    }
  }
}