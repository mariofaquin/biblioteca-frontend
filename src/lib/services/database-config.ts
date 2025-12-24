import { api } from '@/lib/api'

export interface DatabaseConfig {
  // PostgreSQL
  postgres_host: string
  postgres_port: number
  postgres_database: string
  postgres_username: string
  postgres_password: string
  postgres_ssl: boolean
  
  // Supabase
  supabase_url: string
  supabase_anon_key: string
  supabase_service_key: string
  supabase_enabled: boolean
  
  // Configurações gerais
  database_type: 'postgresql' | 'supabase'
  connection_pool_size: number
  connection_timeout: number
  backup_enabled: boolean
  backup_schedule: string
}

export interface DatabaseTestResult {
  success: boolean
  message: string
  details?: any
}

// Buscar configurações atuais
export async function getDatabaseConfig(): Promise<DatabaseConfig> {
  try {
    const response = await api.get('/api/database/config')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar configurações do banco:', error)
    // Retornar configurações padrão
    return {
      postgres_host: 'localhost',
      postgres_port: 5432,
      postgres_database: 'biblioteca_multiempresa',
      postgres_username: 'postgres',
      postgres_password: '',
      postgres_ssl: false,
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_key: '',
      supabase_enabled: false,
      database_type: 'postgresql',
      connection_pool_size: 10,
      connection_timeout: 30,
      backup_enabled: true,
      backup_schedule: '0 2 * * *'
    }
  }
}

// Salvar configurações
export async function saveDatabaseConfig(config: DatabaseConfig): Promise<void> {
  try {
    console.log('💾 [DatabaseConfig] Salvando configurações:', {
      type: config.database_type,
      host: config.postgres_host,
      database: config.postgres_database,
      supabase_enabled: config.supabase_enabled
    })
    
    const response = await api.post('/api/database/config', config)
    
    if (response.data.success) {
      console.log('✅ [DatabaseConfig] Configurações salvas com sucesso')
    } else {
      throw new Error(response.data.message || 'Erro ao salvar configurações')
    }
  } catch (error: any) {
    console.error('❌ [DatabaseConfig] Erro ao salvar:', error)
    throw new Error(error.response?.data?.message || 'Erro ao salvar configurações do banco')
  }
}

// Testar conexão PostgreSQL
export async function testPostgreSQLConnection(config: {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
}): Promise<DatabaseTestResult> {
  try {
    console.log('🧪 [DatabaseConfig] Testando PostgreSQL:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      ssl: config.ssl
    })
    
    const response = await api.post('/api/database/test/postgresql', config)
    
    return {
      success: response.data.success,
      message: response.data.message,
      details: response.data.details
    }
  } catch (error: any) {
    console.error('❌ [DatabaseConfig] Erro no teste PostgreSQL:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao testar conexão PostgreSQL',
      details: error.response?.data?.details
    }
  }
}

// Testar conexão Supabase
export async function testSupabaseConnection(config: {
  url: string
  anon_key: string
  service_key: string
}): Promise<DatabaseTestResult> {
  try {
    console.log('🧪 [DatabaseConfig] Testando Supabase:', {
      url: config.url,
      hasAnonKey: !!config.anon_key,
      hasServiceKey: !!config.service_key
    })
    
    const response = await api.post('/api/database/test/supabase', config)
    
    return {
      success: response.data.success,
      message: response.data.message,
      details: response.data.details
    }
  } catch (error: any) {
    console.error('❌ [DatabaseConfig] Erro no teste Supabase:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao testar conexão Supabase',
      details: error.response?.data?.details
    }
  }
}

// Reiniciar servidor com novas configurações
export async function restartServerWithNewConfig(): Promise<void> {
  try {
    console.log('🔄 [DatabaseConfig] Reiniciando servidor...')
    
    await api.post('/api/database/restart')
    
    console.log('✅ [DatabaseConfig] Servidor reiniciado')
  } catch (error: any) {
    console.error('❌ [DatabaseConfig] Erro ao reiniciar servidor:', error)
    throw new Error('Erro ao reiniciar servidor')
  }
}