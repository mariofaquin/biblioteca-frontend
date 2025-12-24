/**
 * Sistema de persistência local usando localStorage
 * Simula um banco de dados para modo demo
 */

export interface StorageData {
  users: any[];
  books: any[];
  loans: any[];
  reservations: any[];
  companies: any[];
  settings: any;
  lastUpdated: string;
}

const STORAGE_KEY = 'biblioteca_multiempresa_data';
const STORAGE_VERSION = '1.0.0';

// Dados iniciais padrão
const defaultData: StorageData = {
  users: [
    {
      id: '1',
      name: 'Administrador',
      email: 'root@biblioteca.com',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Admin Demo',
      email: 'admin@demo.com',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'Usuário Demo',
      email: 'user@demo.com',
      role: 'user',
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ],
  books: [
    {
      id: '1',
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '978-85-359-0277-5',
      category: 'Literatura Brasileira',
      publisher: 'Ática',
      year: 1899,
      pages: 176,
      quantity: 5,
      available: 3,
      description: 'Clássico da literatura brasileira',
      cover_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      isbn: '978-85-359-0123-4',
      category: 'Literatura Brasileira',
      publisher: 'Ática',
      year: 1890,
      pages: 240,
      quantity: 3,
      available: 2,
      description: 'Romance naturalista brasileiro',
      cover_url: null,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ],
  loans: [
    {
      id: '1',
      user_id: '3',
      book_id: '1',
      loan_date: '2024-01-15T00:00:00Z',
      due_date: '2024-01-29T00:00:00Z',
      return_date: null,
      status: 'active',
      renewed_count: 0,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
  ],
  reservations: [],
  companies: [
    {
      id: '1',
      name: 'Biblioteca Principal',
      email: 'contato@biblioteca.com',
      phone: '(11) 99999-9999',
      address: 'Rua Principal, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-000',
      subscription_plan: 'premium',
      subscription_status: 'active',
      max_books: 10000,
      max_users: 1000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  settings: {
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
  },
  lastUpdated: new Date().toISOString(),
};

export class LocalStorage {
  /**
   * Inicializa o storage com dados padrão se não existir
   */
  static init(): void {
    if (!this.exists()) {
      this.setData(defaultData);
      console.log('📦 LocalStorage inicializado com dados padrão');
    } else {
      console.log('📦 LocalStorage carregado com dados existentes');
    }
  }

  /**
   * Verifica se existe dados no storage
   */
  static exists(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Obtém todos os dados do storage
   */
  static getData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.init();
        return defaultData;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
      return defaultData;
    }
  }

  /**
   * Salva todos os dados no storage
   */
  static setData(data: StorageData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados salvos no localStorage');
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Obtém dados de uma tabela específica
   */
  static getTable<T = any>(table: keyof StorageData): T[] {
    const data = this.getData();
    return (data[table] as T[]) || [];
  }

  /**
   * Salva dados de uma tabela específica
   */
  static setTable<T = any>(table: keyof StorageData, records: T[]): void {
    const data = this.getData();
    (data[table] as T[]) = records;
    this.setData(data);
  }

  /**
   * Adiciona um registro a uma tabela
   */
  static addRecord<T = any>(table: keyof StorageData, record: T): T {
    const records = this.getTable<T>(table);
    const newRecord = {
      ...record,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    records.push(newRecord);
    this.setTable(table, records);
    console.log(`➕ Registro adicionado à tabela ${table}:`, newRecord);
    return newRecord;
  }

  /**
   * Atualiza um registro em uma tabela
   */
  static updateRecord<T = any>(table: keyof StorageData, id: string, updates: Partial<T>): T | null {
    const records = this.getTable<T & { id: string }>(table);
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      console.warn(`Registro com ID ${id} não encontrado na tabela ${table}`);
      return null;
    }

    records[index] = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.setTable(table, records);
    console.log(`✏️ Registro atualizado na tabela ${table}:`, records[index]);
    return records[index];
  }

  /**
   * Remove um registro de uma tabela
   */
  static deleteRecord(table: keyof StorageData, id: string): boolean {
    const records = this.getTable(table);
    const index = records.findIndex((r: any) => r.id === id);
    
    if (index === -1) {
      console.warn(`Registro com ID ${id} não encontrado na tabela ${table}`);
      return false;
    }

    records.splice(index, 1);
    this.setTable(table, records);
    console.log(`🗑️ Registro removido da tabela ${table}, ID: ${id}`);
    return true;
  }

  /**
   * Busca registros em uma tabela
   */
  static findRecords<T = any>(
    table: keyof StorageData, 
    predicate: (record: T) => boolean
  ): T[] {
    const records = this.getTable<T>(table);
    return records.filter(predicate);
  }

  /**
   * Busca um registro específico
   */
  static findRecord<T = any>(
    table: keyof StorageData, 
    predicate: (record: T) => boolean
  ): T | null {
    const records = this.findRecords(table, predicate);
    return records[0] || null;
  }

  /**
   * Gera um ID único no formato UUID
   */
  static generateId(): string {
    // Gerar UUID v4 simples
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Limpa todos os dados (reset)
   */
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 LocalStorage limpo');
  }

  /**
   * Reset para dados padrão
   */
  static reset(): void {
    this.setData(defaultData);
    console.log('🔄 LocalStorage resetado para dados padrão');
  }

  /**
   * Exporta dados para backup
   */
  static export(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  /**
   * Importa dados de backup
   */
  static import(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.setData(data);
      console.log('📥 Dados importados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas do storage
   */
  static getStats() {
    const data = this.getData();
    return {
      users: data.users.length,
      books: data.books.length,
      loans: data.loans.length,
      reservations: data.reservations.length,
      companies: data.companies.length,
      lastUpdated: data.lastUpdated,
      storageSize: new Blob([JSON.stringify(data)]).size,
    };
  }
}

// Inicializar automaticamente quando o módulo for carregado
if (typeof window !== 'undefined') {
  LocalStorage.init();
}