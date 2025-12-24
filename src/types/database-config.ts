export interface DatabaseConfig {
  id?: string;
  db_type: 'postgres' | 'supabase';
  host?: string;
  port?: number;
  database_name?: string;
  username?: string;
  password?: string;
  supabase_url?: string;
  supabase_key?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseConfigFormData {
  db_type: 'postgres' | 'supabase';
  host?: string;
  port?: number;
  database_name?: string;
  username?: string;
  password?: string;
  supabase_url?: string;
  supabase_key?: string;
  is_active?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    version?: string;
    host?: string;
    port?: number;
    database?: string;
    url?: string;
    status?: string;
  };
  error?: string;
}

export interface DatabaseConfigResponse {
  success: boolean;
  data?: DatabaseConfig | DatabaseConfig[];
  active_config?: DatabaseConfig;
  test_result?: ConnectionTestResult;
  message?: string;
  error?: string;
}