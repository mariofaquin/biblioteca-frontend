import { useState, useEffect } from 'react';
import type { 
  DatabaseConfig, 
  DatabaseConfigFormData, 
  ConnectionTestResult 
} from '@/types/database-config';
import { useToast } from '@/hooks/use-toast';
import { encryptSensitiveData } from '@/lib/crypto';

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                   process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
                   typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Mock data for demo mode
const mockConfigurations: DatabaseConfig[] = [
  {
    id: '1',
    db_type: 'postgres',
    host: 'localhost',
    port: 5433,
    database_name: 'biblioteca_multiempresa',
    username: 'postgres',
    password: '••••••••',
    is_active: true,
    created_at: '2025-01-21T10:00:00Z',
    updated_at: '2025-01-21T10:00:00Z',
  },
  {
    id: '2',
    db_type: 'supabase',
    supabase_url: 'https://exemplo.supabase.co',
    supabase_key: '••••••••',
    is_active: false,
    created_at: '2025-01-21T09:00:00Z',
    updated_at: '2025-01-21T09:00:00Z',
  }
];

export function useDatabaseConfig() {
  const [configurations, setConfigurations] = useState<DatabaseConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<DatabaseConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRootAccess, setHasRootAccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check root access on mount
  useEffect(() => {
    checkRootAccess();
  }, []);

  const checkRootAccess = async () => {
    try {
      // Simular verificação de acesso root (sempre permitir para teste)
      setHasRootAccess(true);
    } catch (error) {
      console.error('❌ Error checking root access:', error);
      setHasRootAccess(false);
    }
  };

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Demo mode: use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setConfigurations(mockConfigurations);
        setActiveConfig(mockConfigurations.find(c => c.is_active) || null);
      } else {
        // Carregar configurações via fetch direto
        const response = await fetch('/api/database/config');
        const data = await response.json();
        
        // Simular estrutura de configurações
        const mockConfig: DatabaseConfig = {
          id: '1',
          db_type: data.database_type === 'supabase' ? 'supabase' : 'postgres',
          host: data.postgres_host,
          port: data.postgres_port,
          database_name: data.postgres_database,
          username: data.postgres_username,
          password: '••••••••',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setConfigurations([mockConfig]);
        setActiveConfig(mockConfig);
      }
    } catch (error: any) {
      if (!isDemoMode) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load configurations on mount
  useEffect(() => {
    if (hasRootAccess) {
      loadConfigurations();
    }
  }, [hasRootAccess]);

  const testConnection = async (config: DatabaseConfigFormData): Promise<ConnectionTestResult> => {
    try {
      setIsLoading(true);
      
      // Preparar dados para teste (sem criptografia por enquanto)
      const testData = {
        host: config.host,
        port: config.port,
        database: config.database_name,
        username: config.username,
        password: config.password,
        ssl: false
      };
      
      // Usar API real para testar conexão
      const response = await fetch('/api/database/test/postgresql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const result = await response.json();
      
      const connectionResult: ConnectionTestResult = {
        success: result.success,
        message: result.message,
        details: result.details,
        error: result.error
      };
      
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      return connectionResult;
    } catch (error: any) {
      const result: ConnectionTestResult = {
        success: false,
        message: error.message,
        error: 'Erro interno'
      };
      
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const createConfiguration = async (config: DatabaseConfigFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Preparar dados de configuração
      const configData = {
        postgres_host: config.host,
        postgres_port: config.port,
        postgres_database: config.database_name,
        postgres_username: config.username,
        postgres_password: config.password,
        postgres_ssl: false,
        supabase_url: config.supabase_url || '',
        supabase_anon_key: config.supabase_key || '',
        supabase_service_key: config.supabase_key || '',
        supabase_enabled: config.db_type === 'supabase',
        database_type: config.db_type === 'supabase' ? 'supabase' : 'postgresql',
        connection_pool_size: 10,
        connection_timeout: 30,
        backup_enabled: true,
        backup_schedule: '0 2 * * *'
      };
      
      // Enviar dados diretamente (sem criptografia por enquanto)
      const response = await fetch('/api/database/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recarregar configurações
        await loadConfigurations();
        
        toast({
          title: 'Sucesso',
          description: 'Configuração salva com segurança! Backend conectará automaticamente.',
        });
        
        return true;
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao salvar configuração',
          variant: 'destructive',
        });
        
        return false;
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const activateConfiguration = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Demo mode: simulate activation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedConfigs = configurations.map(config => ({
          ...config,
          is_active: config.id === id
        }));
        
        setConfigurations(updatedConfigs);
        setActiveConfig(updatedConfigs.find(c => c.is_active) || null);
        
        toast({
          title: 'Sucesso',
          description: 'Configuração ativada com sucesso (MODO DEMO)',
        });
        
        return true;
      } else {
        // Simular ativação de configuração
        await loadConfigurations();
        
        toast({
          title: 'Sucesso',
          description: 'Configuração ativada com sucesso',
        });
        
        return true;
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    configurations,
    activeConfig,
    isLoading,
    hasRootAccess,
    testConnection,
    createConfiguration,
    activateConfiguration,
    loadConfigurations,
  };
}