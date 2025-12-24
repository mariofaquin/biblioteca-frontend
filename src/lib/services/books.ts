import api from '@/lib/api'

export interface Book {
  id: string
  company_id: string
  title: string
  author: string
  isbn?: string
  category: string
  synopsis?: string
  cover_image?: string
  cover_url?: string
  number?: string
  total_copies: number
  available_copies: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateBookData {
  title: string
  author: string
  isbn?: string
  category: string
  synopsis?: string
  cover_image?: string
  cover_url?: string
  number?: string
  total_copies: number
  available_copies: number
  is_available?: boolean
}

export interface UpdateBookData {
  title?: string
  author?: string
  isbn?: string
  category?: string
  synopsis?: string
  cover_image?: string
  cover_url?: string
  number?: string
  total_copies?: number
  available_copies?: number
  is_available?: boolean
}

export interface BooksFilters {
  search?: string
  category?: string
  availability?: 'available' | 'unavailable'
  per_page?: number
  page?: number
}

export interface BooksResponse {
  data: Book[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// Sistema de cache e sincronização
const STORAGE_KEY = 'books_cache'
const PENDING_SYNC_KEY = 'books_pending_sync'

// Função para verificar se a API está disponível
async function isApiAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log('🔍 API Health Check:', { status: response.status, ok: response.ok })
    return response.ok
  } catch (error) {
    console.error('❌ API não disponível:', error)
    return false
  }
}

// Função para salvar no cache local
function saveToCache(books: Book[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  }
}

// Função para carregar do cache local
function loadFromCache(): Book[] {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY)
    return cached ? JSON.parse(cached) : []
  }
  return []
}

// Função para adicionar operação pendente de sincronização
function addPendingSync(operation: any): void {
  if (typeof window !== 'undefined') {
    const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]')
    pending.push({ ...operation, timestamp: Date.now() })
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending))
  }
}

// Função para sincronizar operações pendentes
async function syncPendingOperations(): Promise<void> {
  if (typeof window === 'undefined') return
  
  const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]')
  if (pending.length === 0) return

  const apiAvailable = await isApiAvailable()
  if (!apiAvailable) return

  const successfulSyncs: number[] = []

  for (let i = 0; i < pending.length; i++) {
    const operation = pending[i]
    try {
      switch (operation.type) {
        case 'create':
          await api.post('/books', operation.data)
          break
        case 'update':
          await api.put(`/books/${operation.id}`, operation.data)
          break
        case 'delete':
          await api.delete(`/books/${operation.id}`)
          break
      }
      successfulSyncs.push(i)
    } catch (error) {
      console.error('Erro ao sincronizar operação:', error)
    }
  }

  // Remove operações sincronizadas com sucesso
  const remainingPending = pending.filter((_: any, index: number) => !successfulSyncs.includes(index))
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remainingPending))
}

// Dados iniciais para desenvolvimento (sem imagens para evitar URLs aleatórias)
const initialBooks: Book[] = [
  {
    id: '1',
    company_id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Tecnologia',
    synopsis: 'Um guia para escrever código limpo e maintível',
    cover_image: '',
    total_copies: 5,
    available_copies: 3,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    company_id: '1',
    title: 'O Alquimista',
    author: 'Paulo Coelho',
    isbn: '978-8576657224',
    category: 'Literatura',
    synopsis: 'A história de Santiago em busca do seu tesouro pessoal',
    cover_image: '',
    total_copies: 2,
    available_copies: 0,
    is_available: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    company_id: '1',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '978-8535926279',
    category: 'História',
    synopsis: 'Uma breve história da humanidade',
    cover_image: '',
    total_copies: 3,
    available_copies: 1,
    is_available: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    company_id: '1',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    isbn: '978-0596517748',
    category: 'Tecnologia',
    synopsis: 'As melhores práticas da linguagem JavaScript',
    cover_image: '',
    total_copies: 4,
    available_copies: 2,
    is_available: true,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
]

// Inicializar cache se não existir
function initializeCache(): Book[] {
  let books = loadFromCache()
  if (books.length === 0) {
    books = [...initialBooks]
    saveToCache(books)
  }
  return books
}

// Função para limpar cache (útil para desenvolvimento)
function clearCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PENDING_SYNC_KEY)
    console.log('Cache de livros limpo')
  }
}

export const booksService = {
  async getBooks(filters: BooksFilters = {}): Promise<BooksResponse> {
    // Tentar sincronizar operações pendentes primeiro
    await syncPendingOperations()
    
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.availability) params.append('availability', filters.availability)
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.page) params.append('page', filters.page.toString())

      console.log('📡 Fazendo requisição para API...')
      const response = await api.get(`/books?${params.toString()}`)
      
      console.log('✅ API respondeu com sucesso!')
      
      // Debug: verificar se as imagens estão chegando
      if (response.data?.data) {
        console.log('📚 Livros recebidos da API:', response.data.data.map((book: any) => ({
          title: book.title,
          hasImage: !!book.cover_image,
          imageType: book.cover_image ? book.cover_image.substring(0, 30) + '...' : 'sem imagem'
        })))
        saveToCache(response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Erro na API, usando cache local:', error)
      
      // Fallback para cache local
      let books = initializeCache()
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        books = books.filter(book => 
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          book.isbn?.includes(search)
        )
      }
      
      if (filters.category && filters.category !== 'all') {
        books = books.filter(book => book.category === filters.category)
      }
      
      if (filters.availability) {
        if (filters.availability === 'available') {
          books = books.filter(book => book.is_available)
        } else {
          books = books.filter(book => !book.is_available)
        }
      }
      
      const page = filters.page || 1
      const perPage = filters.per_page || 20
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedBooks = books.slice(startIndex, endIndex)
      
      return {
        data: paginatedBooks,
        current_page: page,
        last_page: Math.ceil(books.length / perPage),
        per_page: perPage,
        total: books.length,
      }
    }
  },

  async getBook(id: string): Promise<ApiResponse<Book>> {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data
    } catch (error) {
      const books = initializeCache()
      const book = books.find(b => b.id === id)
      if (!book) throw new Error('Livro não encontrado')
      return { data: book }
    }
  },

  async createBook(data: CreateBookData): Promise<ApiResponse<Book>> {
    // Calcular is_available automaticamente baseado em available_copies
    const is_available = (data.available_copies || 0) > 0
    
    const bookData = {
      ...data,
      is_available
    }
    
    const newBook: Book = {
      id: Math.random().toString(36).substring(2, 11),
      company_id: '1',
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      category: data.category,
      synopsis: data.synopsis,
      cover_image: data.cover_image || '',
      cover_url: data.cover_url || '',
      number: data.number || '',
      total_copies: data.total_copies || 0,
      available_copies: data.available_copies || 0,
      is_available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      console.log('📡 Enviando dados para API:', bookData)
      const response = await api.post('/books', bookData)
      console.log('✅ Resposta da API:', response.data)
      
      // Se a API funcionou, atualizar o cache com os dados da API
      const books = initializeCache()
      const updatedBooks = [response.data.data, ...books.filter(b => b.id !== response.data.data.id)]
      saveToCache(updatedBooks)
      return response.data
    } catch (error) {
      console.warn('API não disponível, salvando localmente e agendando sincronização')
      
      // Salvar localmente
      const books = initializeCache()
      const updatedBooks = [newBook, ...books]
      saveToCache(updatedBooks)
      
      // Agendar para sincronização
      addPendingSync({
        type: 'create',
        data: bookData,
        localId: newBook.id
      })
      
      return {
        data: newBook,
        message: 'Livro criado localmente (será sincronizado quando a API estiver disponível)',
      }
    }
  },

  async updateBook(id: string, data: UpdateBookData): Promise<ApiResponse<Book>> {
    try {
      const response = await api.put(`/books/${id}`, data)
      
      // Atualizar cache local
      const books = initializeCache()
      const bookIndex = books.findIndex(b => b.id === id)
      if (bookIndex !== -1) {
        books[bookIndex] = response.data.data
        saveToCache(books)
      }
      
      return response.data
    } catch (error) {
      console.warn('API não disponível, salvando localmente e agendando sincronização')
      
      // Atualizar localmente
      const books = initializeCache()
      const bookIndex = books.findIndex(b => b.id === id)
      if (bookIndex === -1) throw new Error('Livro não encontrado')
      
      books[bookIndex] = {
        ...books[bookIndex],
        ...data,
        updated_at: new Date().toISOString(),
      }
      saveToCache(books)
      
      // Agendar para sincronização
      addPendingSync({
        type: 'update',
        id: id,
        data: data
      })
      
      return {
        data: books[bookIndex],
        message: 'Livro atualizado localmente (será sincronizado quando a API estiver disponível)',
      }
    }
  },

  async deleteBook(id: string): Promise<ApiResponse<null>> {
    console.log('🗑️ deleteBook chamado com ID:', id)
    
    try {
      console.log('📡 Enviando DELETE para API:', `/books/${id}`)
      const response = await api.delete(`/books/${id}`)
      
      console.log('✅ API respondeu:', response.status, response.data)
      
      // Remover do cache local
      const books = initializeCache()
      const updatedBooks = books.filter(b => b.id !== id)
      saveToCache(updatedBooks)
      
      return response.data
    } catch (error: any) {
      console.error('❌ Erro ao excluir livro:', error)
      console.error('❌ Resposta completa do erro:', error.response)
      console.error('❌ Dados do erro:', error.response?.data)
      console.error('❌ Status do erro:', error.response?.status)
      console.error('❌ Mensagem do erro:', error.message)
      
      // SEMPRE propagar o erro para o hook mostrar a mensagem
      throw error
    }
  },

  // Função para forçar sincronização
  async forcSync(): Promise<void> {
    await syncPendingOperations()
  },

  // Função para obter status da sincronização
  getSyncStatus(): { pending: number; lastSync: string | null } {
    if (typeof window === 'undefined') return { pending: 0, lastSync: null }
    
    const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]')
    const lastSync = localStorage.getItem('last_sync_timestamp')
    
    return {
      pending: pending.length,
      lastSync: lastSync ? new Date(parseInt(lastSync)).toLocaleString() : null
    }
  },

  // Função para limpar cache (desenvolvimento)
  clearCache,

  // Função para buscar categorias únicas
  async getCategories(): Promise<string[]> {
    try {
      console.log('📡 Buscando categorias da API...')
      const response = await api.get('/books/categories')
      console.log('✅ Categorias recebidas:', response.data)
      
      // Se retornar objetos com propriedade 'name', extrair apenas os nomes
      const categories = response.data.data || []
      if (categories.length > 0 && typeof categories[0] === 'object') {
        return categories.map((cat: any) => cat.name)
      }
      
      return categories
    } catch (error: any) {
      console.error('❌ Erro ao buscar categorias:', error)
      console.error('❌ Detalhes:', error.response?.data)
      // Fallback para categorias padrão
      return ['Tecnologia', 'Literatura', 'História', 'Ciência']
    }
  }
}