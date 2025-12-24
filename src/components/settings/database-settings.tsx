'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/simple-select'
import { Switch } from '@/components/ui/simple-switch'
import { Textarea } from '@/components/ui/simple-textarea'
import { 
  Database, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  Cloud,
  Server,
  Key,
  Globe
} from 'lucide-react'

interface DatabaseConfig {
  // PostgreSQL Local
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

export function DatabaseSettings() {
  const [activeTab, setActiveTab] = useState('postgresql')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DatabaseConfig>({
    defaultValues: {
      // PostgreSQL
      postgres_host: 'localhost',
      postgres_port: 5432,
      postgres_database: 'biblioteca',
      postgres_username: 'postgres',
      postgres_password: '',
      postgres_ssl: false,
      
      // Supabase
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_key: '',
      supabase_enabled: false,
      
      // Gerais
      database_type: 'postgresql',
      connection_pool_size: 10,
      connection_timeout: 30,
      backup_enabled: true,
      backup_schedule: '0 2 * * *', // 2:00 AM diariamente
    }
  })

  const databaseType = watch('database_type')
  const supabaseEnabled = watch('supabase_enabled')
  const postgresSSL = watch('postgres_ssl')

  // Limpar status de conexão quando trocar de aba
  useEffect(() => {
    setConnectionStatus('idle')
    setConnectionMessage('')
    console.log(`🔄 [DatabaseSettings] Aba alterada para: ${activeTab}`)
  }, [activeTab])

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      console.log(`🧪 [DatabaseSettings] Testando conexão: ${activeTab}`)
      
      let result = { success: false, message: '' }
      
      if (activeTab === 'postgresql') {
        // Testar PostgreSQL
        const postgresData = {
          host: watch('postgres_host'),
          port: watch('postgres_port'),
          database: watch('postgres_database'),
          username: watch('postgres_username'),
          password: watch('postgres_password'),
          ssl: watch('postgres_ssl')
        }
        
        console.log('🐘 [DatabaseSettings] Testando PostgreSQL:', {
          host: postgresData.host,
          port: postgresData.port,
          database: postgresData.database,
          username: postgresData.username,
          ssl: postgresData.ssl
        })
        
        // Validar campos obrigatórios
        if (!postgresData.host || !postgresData.database || !postgresData.username || !postgresData.password) {
          result = {
            success: false,
            message: 'Preencha todos os campos obrigatórios do PostgreSQL'
          }
        } else {
          // Usar serviço real para testar
          const { testPostgreSQLConnection } = await import('@/lib/services/database-config')
          result = await testPostgreSQLConnection(postgresData)
        }
        
      } else if (activeTab === 'supabase') {
        // Testar Supabase
        const supabaseData = {
          url: watch('supabase_url'),
          anon_key: watch('supabase_anon_key'),
          service_key: watch('supabase_service_key'),
          enabled: watch('supabase_enabled')
        }
        
        console.log('☁️ [DatabaseSettings] Testando Supabase:', {
          url: supabaseData.url,
          enabled: supabaseData.enabled,
          hasAnonKey: !!supabaseData.anon_key,
          hasServiceKey: !!supabaseData.service_key
        })
        
        if (!supabaseData.enabled) {
          result = {
            success: false,
            message: 'Habilite o Supabase antes de testar a conexão'
          }
        } else if (!supabaseData.url || !supabaseData.anon_key || !supabaseData.service_key) {
          result = {
            success: false,
            message: 'Preencha todos os campos obrigatórios do Supabase'
          }
        } else if (!supabaseData.url.includes('supabase.co')) {
          result = {
            success: false,
            message: 'URL do Supabase deve conter "supabase.co"'
          }
        } else {
          // Usar serviço real para testar
          const { testSupabaseConnection } = await import('@/lib/services/database-config')
          result = await testSupabaseConnection(supabaseData)
        }
        
      } else {
        result = {
          success: false,
          message: 'Selecione uma aba para testar a conexão'
        }
      }
      
      if (result.success) {
        setConnectionStatus('success')
        setConnectionMessage(result.message)
        console.log('✅ [DatabaseSettings] Teste bem-sucedido:', result.message)
      } else {
        setConnectionStatus('error')
        setConnectionMessage(result.message)
        console.log('❌ [DatabaseSettings] Teste falhou:', result.message)
      }
      
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('Erro interno ao testar conexão.')
      console.error('❌ [DatabaseSettings] Erro no teste:', error)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const onSubmit = async (data: DatabaseConfig) => {
    console.log('💾 [DatabaseSettings] Salvando configurações:', data)
    
    try {
      // Usar serviço real para salvar
      const { saveDatabaseConfig } = await import('@/lib/services/database-config')
      await saveDatabaseConfig(data)
      
      alert('Configurações salvas no arquivo .env com sucesso!\n\nReinicie o servidor para aplicar as mudanças.')
    } catch (error: any) {
      console.error('❌ [DatabaseSettings] Erro ao salvar:', error)
      alert('Erro ao salvar configurações: ' + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Alerta de Segurança */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-800">Configurações Sensíveis</h4>
            <p className="text-sm text-orange-700 mt-1">
              Estas configurações afetam todo o sistema. Alterações incorretas podem causar 
              indisponibilidade do serviço. Teste sempre as conexões antes de salvar.
            </p>
          </div>
        </div>
      </div>

      {/* Tipo de Banco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Tipo de Banco de Dados
          </CardTitle>
          <CardDescription>
            Escolha entre PostgreSQL local ou Supabase na nuvem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="database_type">Tipo de Banco</Label>
              <Select
                value={databaseType}
                onValueChange={(value) => setValue('database_type', value as 'postgresql' | 'supabase')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      PostgreSQL Local
                    </div>
                  </SelectItem>
                  <SelectItem value="supabase">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Supabase (Nuvem)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações por Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="postgresql" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            PostgreSQL
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Supabase
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* PostgreSQL */}
        <TabsContent value="postgresql" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações PostgreSQL</CardTitle>
              <CardDescription>
                Configure a conexão com seu banco PostgreSQL local ou remoto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postgres_host">Host</Label>
                  <Input
                    id="postgres_host"
                    {...register('postgres_host', { required: 'Host é obrigatório' })}
                    placeholder="localhost"
                  />
                  {errors.postgres_host && (
                    <p className="text-sm text-red-600 mt-1">{errors.postgres_host.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postgres_port">Porta</Label>
                  <Input
                    id="postgres_port"
                    type="number"
                    {...register('postgres_port', { 
                      required: 'Porta é obrigatória',
                      min: { value: 1, message: 'Porta deve ser maior que 0' },
                      max: { value: 65535, message: 'Porta deve ser menor que 65536' }
                    })}
                    placeholder="5432"
                  />
                  {errors.postgres_port && (
                    <p className="text-sm text-red-600 mt-1">{errors.postgres_port.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="postgres_database">Nome do Banco</Label>
                <Input
                  id="postgres_database"
                  {...register('postgres_database', { required: 'Nome do banco é obrigatório' })}
                  placeholder="biblioteca"
                />
                {errors.postgres_database && (
                  <p className="text-sm text-red-600 mt-1">{errors.postgres_database.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postgres_username">Usuário</Label>
                  <Input
                    id="postgres_username"
                    {...register('postgres_username', { required: 'Usuário é obrigatório' })}
                    placeholder="postgres"
                  />
                  {errors.postgres_username && (
                    <p className="text-sm text-red-600 mt-1">{errors.postgres_username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postgres_password">Senha</Label>
                  <Input
                    id="postgres_password"
                    type="password"
                    {...register('postgres_password', { required: 'Senha é obrigatória' })}
                    placeholder="••••••••"
                  />
                  {errors.postgres_password && (
                    <p className="text-sm text-red-600 mt-1">{errors.postgres_password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="postgres_ssl"
                  checked={postgresSSL}
                  onCheckedChange={(checked) => setValue('postgres_ssl', checked)}
                />
                <Label htmlFor="postgres_ssl">Usar SSL</Label>
              </div>

              {/* Teste PostgreSQL */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection || activeTab !== 'postgresql'}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    {isTestingConnection && activeTab === 'postgresql' ? 'Testando PostgreSQL...' : 'Testar PostgreSQL'}
                  </Button>

                  {activeTab === 'postgresql' && connectionStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{connectionMessage}</span>
                    </div>
                  )}

                  {activeTab === 'postgresql' && connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm">{connectionMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supabase */}
        <TabsContent value="supabase" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Supabase</CardTitle>
              <CardDescription>
                Configure a conexão com seu projeto Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="supabase_enabled"
                  checked={supabaseEnabled}
                  onCheckedChange={(checked) => setValue('supabase_enabled', checked)}
                />
                <Label htmlFor="supabase_enabled">Habilitar Supabase</Label>
              </div>

              {supabaseEnabled && (
                <>
                  <div>
                    <Label htmlFor="supabase_url">URL do Projeto</Label>
                    <Input
                      id="supabase_url"
                      {...register('supabase_url', { 
                        required: supabaseEnabled ? 'URL é obrigatória' : false 
                      })}
                      placeholder="https://seu-projeto.supabase.co"
                    />
                    {errors.supabase_url && (
                      <p className="text-sm text-red-600 mt-1">{errors.supabase_url.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supabase_anon_key">Chave Anônima (Public)</Label>
                    <Textarea
                      id="supabase_anon_key"
                      {...register('supabase_anon_key', { 
                        required: supabaseEnabled ? 'Chave anônima é obrigatória' : false 
                      })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      rows={3}
                    />
                    {errors.supabase_anon_key && (
                      <p className="text-sm text-red-600 mt-1">{errors.supabase_anon_key.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supabase_service_key">Chave de Serviço (Private)</Label>
                    <Textarea
                      id="supabase_service_key"
                      {...register('supabase_service_key', { 
                        required: supabaseEnabled ? 'Chave de serviço é obrigatória' : false 
                      })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      rows={3}
                    />
                    {errors.supabase_service_key && (
                      <p className="text-sm text-red-600 mt-1">{errors.supabase_service_key.message}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      ⚠️ Mantenha esta chave segura. Ela tem acesso total ao seu banco.
                    </p>
                  </div>

                  {/* Teste Supabase */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={testConnection}
                        disabled={isTestingConnection || activeTab !== 'supabase'}
                        className="flex items-center gap-2"
                      >
                        <TestTube className="w-4 h-4" />
                        {isTestingConnection && activeTab === 'supabase' ? 'Testando Supabase...' : 'Testar Supabase'}
                      </Button>

                      {activeTab === 'supabase' && connectionStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">{connectionMessage}</span>
                        </div>
                      )}

                      {activeTab === 'supabase' && connectionStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm">{connectionMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configurações de performance e backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connection_pool_size">Tamanho do Pool de Conexões</Label>
                  <Input
                    id="connection_pool_size"
                    type="number"
                    {...register('connection_pool_size', { 
                      min: { value: 1, message: 'Mínimo 1 conexão' },
                      max: { value: 100, message: 'Máximo 100 conexões' }
                    })}
                    placeholder="10"
                  />
                  {errors.connection_pool_size && (
                    <p className="text-sm text-red-600 mt-1">{errors.connection_pool_size.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="connection_timeout">Timeout de Conexão (segundos)</Label>
                  <Input
                    id="connection_timeout"
                    type="number"
                    {...register('connection_timeout', { 
                      min: { value: 5, message: 'Mínimo 5 segundos' },
                      max: { value: 300, message: 'Máximo 300 segundos' }
                    })}
                    placeholder="30"
                  />
                  {errors.connection_timeout && (
                    <p className="text-sm text-red-600 mt-1">{errors.connection_timeout.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backup_enabled"
                    checked={watch('backup_enabled')}
                    onCheckedChange={(checked) => setValue('backup_enabled', checked)}
                  />
                  <Label htmlFor="backup_enabled">Habilitar Backup Automático</Label>
                </div>

                {watch('backup_enabled') && (
                  <div>
                    <Label htmlFor="backup_schedule">Agendamento do Backup (Cron)</Label>
                    <Input
                      id="backup_schedule"
                      {...register('backup_schedule')}
                      placeholder="0 2 * * * (2:00 AM diariamente)"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Formato cron: minuto hora dia mês dia-da-semana
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  )
}