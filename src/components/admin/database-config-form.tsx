'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/simple-select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, TestTube, CheckCircle, XCircle, Shield } from 'lucide-react';
import { useDatabaseConfig } from '@/hooks/use-database-config';
import type { DatabaseConfigFormData, ConnectionTestResult } from '@/types/database-config';

const configSchema = z.object({
  db_type: z.enum(['postgres', 'supabase']),
  host: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  database_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  supabase_url: z.string().url().optional().or(z.literal('')),
  supabase_key: z.string().optional(),
  is_active: z.boolean().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

export function DatabaseConfigForm() {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const {
    configurations,
    activeConfig,
    isLoading,
    hasRootAccess,
    testConnection,
    createConfiguration,
    activateConfiguration,
  } = useDatabaseConfig();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      db_type: 'postgres',
      is_active: false,
    },
  });

  const dbType = watch('db_type');

  // Show access denied if not root user
  if (hasRootAccess === false) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
          <CardDescription>
            Apenas usuários com role &quot;root&quot; podem acessar a parametrização de banco de dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Entre em contato com o administrador do sistema para obter acesso.
          </p>
          <Badge variant="destructive">Acesso Negado</Badge>
        </CardContent>
      </Card>
    );
  }

  // Show loading while checking access
  if (hasRootAccess === null) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Verificando permissões...</span>
        </CardContent>
      </Card>
    );
  }

  const handleTestConnection = async () => {
    const formData = watch();
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection(formData as DatabaseConfigFormData);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ConfigFormData) => {
    const success = await createConfiguration(data as DatabaseConfigFormData);
    if (success) {
      reset();
      setTestResult(null);
    }
  };

  const handleActivateConfig = async (id: string) => {
    await activateConfiguration(id);
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {(process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
        process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
        !process.env.NEXT_PUBLIC_API_URL) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-800 font-medium">MODO DEMONSTRAÇÃO</span>
            </div>
            <p className="text-blue-700 text-sm mt-2">
              Esta funcionalidade está sendo executada em modo demo. 
              Todas as operações são simuladas e não afetam um banco de dados real.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Configuration Display */}
      {activeConfig && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              Configuração Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Tipo:</Label>
                <p className="capitalize">{activeConfig.db_type}</p>
              </div>
              {activeConfig.db_type === 'postgres' ? (
                <>
                  <div>
                    <Label className="font-medium">Host:</Label>
                    <p>{activeConfig.host}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Porta:</Label>
                    <p>{activeConfig.port}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Banco:</Label>
                    <p>{activeConfig.database_name}</p>
                  </div>
                </>
              ) : (
                <div>
                  <Label className="font-medium">URL:</Label>
                  <p className="truncate">{activeConfig.supabase_url}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Form */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Configuração de Banco de Dados
          </CardTitle>
          <CardDescription>
            Configure a conexão com PostgreSQL ou Supabase. Apenas usuários root podem alterar essas configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Database Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="db_type">Tipo de Banco de Dados</Label>
              <Select
                value={dbType}
                onValueChange={(value) => setValue('db_type', value as 'postgres' | 'supabase')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="supabase">Supabase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PostgreSQL Fields */}
            {dbType === 'postgres' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    {...register('host')}
                    placeholder="localhost"
                    className={errors.host ? 'border-red-500' : ''}
                  />
                  {errors.host && (
                    <p className="text-sm text-red-500">{errors.host.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    {...register('port', { valueAsNumber: true })}
                    placeholder="5432"
                    className={errors.port ? 'border-red-500' : ''}
                  />
                  {errors.port && (
                    <p className="text-sm text-red-500">{errors.port.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database_name">Nome do Banco</Label>
                  <Input
                    id="database_name"
                    {...register('database_name')}
                    placeholder="biblioteca_multiempresa"
                    className={errors.database_name ? 'border-red-500' : ''}
                  />
                  {errors.database_name && (
                    <p className="text-sm text-red-500">{errors.database_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="postgres"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Supabase Fields */}
            {dbType === 'supabase' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase_url">URL do Supabase</Label>
                  <Input
                    id="supabase_url"
                    {...register('supabase_url')}
                    placeholder="https://xxx.supabase.co"
                    className={errors.supabase_url ? 'border-red-500' : ''}
                  />
                  {errors.supabase_url && (
                    <p className="text-sm text-red-500">{errors.supabase_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase_key">Chave API do Supabase</Label>
                  <Input
                    id="supabase_key"
                    type="password"
                    {...register('supabase_key')}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className={errors.supabase_key ? 'border-red-500' : ''}
                  />
                  {errors.supabase_key && (
                    <p className="text-sm text-red-500">{errors.supabase_key.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </span>
                </div>
                
                {testResult.details && (
                  <div className="text-sm text-gray-600 mt-2">
                    {testResult.details.version && (
                      <p>Versão: {testResult.details.version}</p>
                    )}
                    {testResult.details.host && (
                      <p>Host: {testResult.details.host}:{testResult.details.port}</p>
                    )}
                    {testResult.details.database && (
                      <p>Banco: {testResult.details.database}</p>
                    )}
                  </div>
                )}
                
                {testResult.error && (
                  <p className="text-sm text-red-600 mt-2">
                    Erro: {testResult.error}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || isLoading}
                className="flex items-center"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Testar Conexão
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !testResult?.success}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Salvar Configuração
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      {configurations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações Existentes</CardTitle>
            <CardDescription>
              Lista de todas as configurações de banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className={`p-4 border rounded-lg ${
                    config.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.db_type.toUpperCase()}
                        </Badge>
                        {config.is_active && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {config.db_type === 'postgres' 
                          ? `${config.host}:${config.port}/${config.database_name}`
                          : config.supabase_url
                        }
                      </p>
                    </div>
                    
                    {!config.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => config.id && handleActivateConfig(config.id)}
                        disabled={isLoading}
                      >
                        Ativar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}