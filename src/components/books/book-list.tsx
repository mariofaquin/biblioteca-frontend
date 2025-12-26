'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, BookOpen, Calendar, User, Edit, Eye, CheckCircle, RotateCcw, Grid3X3, List, Trash2 } from 'lucide-react'
import { BookCover } from '@/components/ui/book-cover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/simple-select'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/simple-modal'
import { BookForm } from './book-form'
import { SimpleBookImport } from './simple-book-import'
import { useBooks, useDeleteBook } from '@/hooks/use-books'
import { usePermissions } from '@/hooks/use-permissions'
import { useReservations } from '@/hooks/use-reservations'
import { useCompany } from '@/hooks/use-company'
import { useLoans } from '@/hooks/use-loans'
import { useCategories } from '@/hooks/use-categories'
import { Book } from '@/lib/services/books'
import { useToast } from '@/hooks/use-toast'

export function BookList() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showImportForm, setShowImportForm] = useState(false)
  const [reservingBook, setReservingBook] = useState<string | null>(null)
  const [showingHistoryFor, setShowingHistoryFor] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  
  const { toast } = useToast()
  const { canManageBooks } = usePermissions()
  const { selectedCompany, user } = useCompany()
  const { createReservation, getUserPosition, getBookQueue } = useReservations()
  const { data: loansData } = useLoans()
  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []
  const deleteBookMutation = useDeleteBook()

  const { data: booksData, isLoading } = useBooks({
    search: search || undefined,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    availability: availabilityFilter === 'all' ? undefined : availabilityFilter as 'available' | 'unavailable',
    page: currentPage,
    per_page: 20,
  })

  const books = booksData?.data || []
  const loans = loansData?.data || []
  
  // FALLBACK: Se a API retornar apenas as 4 categorias padrão,
  // extrair categorias únicas dos livros visíveis
  const allCategories = React.useMemo(() => {
    // Garantir que categories é um array
    const categoriesArray = Array.isArray(categories) ? categories : []
    
    // Se temos categorias da API e são mais que as 4 padrão, usar elas
    if (categoriesArray.length > 4) {
      return categoriesArray
    }
    
    // Verificar se são as categorias hardcoded
    const isHardcoded = categoriesArray.length === 4 && 
      categoriesArray.includes('Tecnologia') && 
      categoriesArray.includes('Literatura') &&
      categoriesArray.includes('História') &&
      categoriesArray.includes('Ciência')
    
    if (isHardcoded && books.length > 0) {
      // Extrair categorias únicas dos livros
      const bookCategories = [...new Set(books.map(book => book.category).filter(Boolean))].sort()
      console.log('⚠️ Usando categorias dos livros como fallback:', bookCategories)
      return bookCategories
    }
    
    return categoriesArray
  }, [categories, books])
  
  // Resetar página quando filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, availabilityFilter])
  
  // Função para verificar se o usuário já emprestou este livro
  const hasUserBorrowedBook = (bookId: string): boolean => {
    if (!user) return false
    return loans.some(loan => 
      loan.book_id === bookId && 
      loan.user_id === user.id
    )
  }

  // Função para verificar se o livro foi emprestado por alguém (para admins)
  const hasBookBeenBorrowed = (bookId: string): boolean => {
    return loans.some(loan => loan.book_id === bookId)
  }

  // Função para obter estatísticas do livro para o usuário
  const getUserBookStats = (bookId: string) => {
    if (!user) return null
    
    const userLoans = loans.filter(loan => 
      loan.book_id === bookId && 
      loan.user_id === user.id
    )
    
    if (userLoans.length === 0) return null
    
    const totalBorrows = userLoans.length
    const lastBorrow = userLoans.sort((a, b) => 
      new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
    )[0]
    
    return {
      totalBorrows,
      lastBorrowDate: lastBorrow.borrowed_at,
      hasReturned: lastBorrow.status === 'returned',
      isCurrentlyBorrowed: lastBorrow.status === 'active' || lastBorrow.status === 'overdue'
    }
  }

  // Função para obter estatísticas gerais do livro (para admins)
  const getBookGeneralStats = (bookId: string) => {
    const bookLoans = loans.filter(loan => loan.book_id === bookId)
    
    if (bookLoans.length === 0) return null
    
    const totalBorrows = bookLoans.length
    const uniqueUsers = new Set(bookLoans.map(loan => loan.user_id)).size
    const currentlyBorrowed = bookLoans.filter(loan => 
      loan.status === 'active' || loan.status === 'overdue'
    ).length
    const lastBorrow = bookLoans.sort((a, b) => 
      new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
    )[0]
    
    return {
      totalBorrows,
      uniqueUsers,
      currentlyBorrowed,
      lastBorrowDate: lastBorrow.borrowed_at,
      isCurrentlyBorrowed: currentlyBorrowed > 0
    }
  }
  
  // Debug removido para evitar loops

  const handleReserveBook = async (book: Book) => {
    try {
      setReservingBook(book.id)
      
      // Verificar usuário logado
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast({
          title: "❌ Erro de Autenticação",
          description: "Faça login para emprestar livros",
          variant: "destructive",
        })
        return
      }
      
      const currentUser = JSON.parse(userStr)
      if (!currentUser?.id) {
        toast({
          title: "❌ Usuário Inválido",
          description: "Dados do usuário não encontrados",
          variant: "destructive",
        })
        return
      }
      
      if (book.is_available) {
        // Livro disponível - fazer empréstimo via API
        console.log('📚 Fazendo empréstimo do livro:', book.title)
        
        // Verificar se tem empresa selecionada
        const companyStr = localStorage.getItem('selectedCompany') || localStorage.getItem('selected_company')
        let companyId = currentUser.company_id
        
        if (companyStr) {
          try {
            const company = JSON.parse(companyStr)
            companyId = company.id
          } catch (e) {
            console.error('Erro ao parsear empresa:', e)
          }
        }
        
        if (!companyId) {
          toast({
            title: "❌ Empresa Não Selecionada",
            description: "Selecione uma empresa antes de emprestar livros",
            variant: "destructive",
          })
          return
        }
        
        try {
          const response = await fetch('/api/loans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-company-id': companyId
            },
            body: JSON.stringify({
              user_id: currentUser.id,
              book_id: book.id
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Empréstimo criado via API:', result)
            
            toast({
              title: "✅ Empréstimo Realizado!",
              description: `Livro "${book.title}" emprestado com sucesso`,
              variant: "success",
            })
            
            // Recarregar dados
            window.location.reload()
            return
          } else {
            const error = await response.json()
            throw new Error(error.error || 'Erro na API')
          }
        } catch (error: any) {
          console.error('❌ Erro na API de empréstimos:', error)
          
          toast({
            title: "❌ Erro no Empréstimo",
            description: error.message || "Não foi possível realizar o empréstimo",
            variant: "destructive",
          })
        }
      } else {
        // Livro indisponível - entrar na fila de espera
        console.log('📋 Entrando na fila de espera para o livro:', book.title)
        
        try {
          // Verificar posição atual na fila
          const currentPosition = getUserPosition(book.id)
          if (currentPosition) {
            const queue = getBookQueue(book.id)
            
            toast({
              title: "📋 Já na Fila",
              description: `Você já está na posição ${currentPosition} da fila para "${book.title}"`,
              variant: "info",
            })
            return
          }
          
          // Criar nova reserva
          const reservation = await createReservation({
            book_id: book.id,
            book_title: book.title,
            book_author: book.author,
            book_isbn: book.isbn || '',
            book_cover_image: book.cover_image || ''
          })
          
          toast({
            title: "✅ Entrou na Fila!",
            description: `Posição ${reservation.position_in_queue} para "${book.title}"`,
            variant: "success",
          })
          
          // Recarregar página para atualizar interface
          window.location.reload()
          
        } catch (error: any) {
          console.error('❌ Erro ao criar reserva:', error)
          
          toast({
            title: "❌ Erro na Reserva",
            description: error.message || "Não foi possível entrar na fila",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro na operação:', error)
      alert('Erro ao conectar com o servidor')
    } finally {
      setReservingBook(null)
    }
  }

  const handleDeleteBook = async (book: Book) => {
    // Verificar permissão
    if (!canManageBooks()) {
      toast({
        title: '❌ Sem Permissão',
        description: 'Apenas Admin e Root podem excluir livros',
        variant: 'destructive',
      })
      return
    }
    
    // Confirmação dupla
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO!\n\n` +
      `Tem certeza que deseja excluir o livro:\n\n` +
      `"${book.title}"\n` +
      `de ${book.author}?\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Nota: Só é possível excluir se não houver empréstimos ou reservas ativas.`
    )
    
    if (!confirmed) return
    
    // Segunda confirmação
    const doubleConfirmed = window.confirm(
      `🚨 ÚLTIMA CONFIRMAÇÃO!\n\n` +
      `Você está prestes a EXCLUIR PERMANENTEMENTE:\n\n` +
      `"${book.title}"\n\n` +
      `Confirma a exclusão?`
    )
    
    if (!doubleConfirmed) return
    
    // Excluir
    try {
      await deleteBookMutation.mutateAsync(book.id)
    } catch (error) {
      // Erro já tratado pelo hook
      console.error('Erro ao excluir:', error)
    }
  }

  const formatLastBorrowDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `há ${diffDays} dias`
    if (diffDays < 30) return `há ${Math.ceil(diffDays / 7)} semanas`
    if (diffDays < 365) return `há ${Math.ceil(diffDays / 30)} meses`
    return `há ${Math.ceil(diffDays / 365)} anos`
  }

  const getUserHistoryBadge = (book: Book) => {
    const userStats = getUserBookStats(book.id)
    const generalStats = getBookGeneralStats(book.id)
    const isAdmin = canManageBooks()
    
    // Se o usuário tem histórico próprio, mostrar isso primeiro
    if (userStats) {
      const lastBorrowText = formatLastBorrowDate(userStats.lastBorrowDate)
      
      if (userStats.isCurrentlyBorrowed) {
        return (
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors"
            title={`Você está com este livro emprestado desde ${lastBorrowText}. Clique para ver detalhes.`}
            onClick={() => setShowingHistoryFor(book.id)}
          >
            <BookOpen className="h-3 w-3" />
            <span>Emprestado por você</span>
          </div>
        )
      }
      
      if (userStats.totalBorrows === 1) {
        return (
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 cursor-pointer hover:bg-green-200 transition-colors"
            title={`Você leu este livro ${lastBorrowText}. Clique para ver detalhes.`}
            onClick={() => setShowingHistoryFor(book.id)}
          >
            <CheckCircle className="h-3 w-3" />
            <span>Já leu</span>
          </div>
        )
      }
      
      if (userStats.totalBorrows > 1) {
        return (
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors"
            title={`Você leu este livro ${userStats.totalBorrows} vezes. Última vez: ${lastBorrowText}. Clique para ver detalhes.`}
            onClick={() => setShowingHistoryFor(book.id)}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Leu {userStats.totalBorrows}x</span>
          </div>
        )
      }
    }
    
    // Se é admin e não tem histórico próprio, mas o livro foi emprestado por outros
    if (isAdmin && !userStats && generalStats) {
      const lastBorrowText = formatLastBorrowDate(generalStats.lastBorrowDate)
      
      if (generalStats.isCurrentlyBorrowed) {
        return (
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors"
            title={`Livro emprestado por ${generalStats.currentlyBorrowed} usuário(s). Clique para ver detalhes.`}
            onClick={() => setShowingHistoryFor(book.id)}
          >
            <User className="h-3 w-3" />
            <span>Emprestado ({generalStats.currentlyBorrowed})</span>
          </div>
        )
      }
      
      return (
        <div 
          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
          title={`${generalStats.totalBorrows} empréstimos por ${generalStats.uniqueUsers} usuário(s). Último: ${lastBorrowText}. Clique para ver detalhes.`}
          onClick={() => setShowingHistoryFor(book.id)}
        >
          <User className="h-3 w-3" />
          <span>{generalStats.totalBorrows} empréstimos</span>
        </div>
      )
    }
    
    return null
  }

  const getAvailabilityBadge = (book: Book) => {
    if (book.is_available) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Disponível
        </span>
      )
    }
    
    // Verificar fila de espera
    const queue = getBookQueue(book.id)
    const userPosition = getUserPosition(book.id)
    
    return (
      <div className="flex flex-col gap-1">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Indisponível
        </span>
        {queue && queue.total_waiting > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {queue.total_waiting} na fila
          </span>
        )}
        {userPosition && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Você: posição {userPosition}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Biblioteca</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie o catálogo de livros da sua empresa
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          {/* Toggle de Visualização */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="h-9 px-3 flex items-center gap-2"
          >
            {viewMode === 'cards' ? (
              <>
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Tabela</span>
                <span className="sm:hidden">Tabela</span>
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Cards</span>
                <span className="sm:hidden">Cards</span>
              </>
            )}
          </Button>
          
          {canManageBooks() && (
            <>
              <Button variant="outline" onClick={() => setShowImportForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Livro
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar livros..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros em linha no mobile, lado a lado no desktop */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponíveis</SelectItem>
                  <SelectItem value="unavailable">Indisponíveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualização de Livros */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {books.map((book) => (
          <Card key={book.id} className={`hover:shadow-lg transition-shadow ${
            hasUserBorrowedBook(book.id) || (canManageBooks() && hasBookBeenBorrowed(book.id))
              ? 'ring-2 ring-blue-200 bg-blue-50/30' 
              : ''
          }`}>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="aspect-[3/4] rounded-md mb-2 sm:mb-3 overflow-hidden">
                <BookCover
                  src={book.cover_image}
                  alt={`Capa do livro ${book.title}`}
                  className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-200"
                  fallbackClassName="w-full h-full rounded-md"
                />
              </div>
              <CardTitle className="text-base sm:text-lg line-clamp-2">{book.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {book.author}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {book.category}
              </div>
              
              <div className="text-xs text-gray-500">
                ISBN: {book.isbn}
              </div>
              
              {book.number && (
                <div className="text-xs text-gray-500 font-medium">
                  📋 Tombo: {book.number}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  {getAvailabilityBadge(book)}
                </div>
                {getUserHistoryBadge(book) && (
                  <div className="flex justify-center">
                    {getUserHistoryBadge(book)}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-2">
                {/* Botões otimizados para mobile - mais altos e touch-friendly */}
                {book.total_copies === 0 ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 h-9 sm:h-8 text-sm"
                    disabled
                  >
                    Indisponível
                  </Button>
                ) : book.is_available ? (
                  <Button 
                    size="sm" 
                    className="flex-1 h-9 sm:h-8 text-sm"
                    onClick={() => handleReserveBook(book)}
                    disabled={reservingBook === book.id}
                  >
                    {reservingBook === book.id ? 'Emprestando...' : 'Emprestar'}
                  </Button>
                ) : (
                  (() => {
                    const userPosition = getUserPosition(book.id)
                    const queue = getBookQueue(book.id)
                    
                    if (userPosition) {
                      return (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-9 sm:h-8 text-sm"
                          disabled
                        >
                          Na fila (pos. {userPosition})
                        </Button>
                      )
                    }
                    
                    return (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-9 sm:h-8 text-sm"
                        onClick={() => handleReserveBook(book)}
                        disabled={reservingBook === book.id}
                      >
                        {reservingBook === book.id ? 'Entrando...' : `Entrar na Fila${queue?.total_waiting ? ` (${queue.total_waiting + 1}º)` : ''}`}
                      </Button>
                    )
                  })()
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingBook(book)}
                  title={canManageBooks() ? 'Editar livro' : 'Ver detalhes'}
                  className="h-9 sm:h-8 w-9 sm:w-8 p-0"
                >
                  {canManageBooks() ? (
                    <Edit className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                {canManageBooks() && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteBook(book)}
                    title="Excluir livro (apenas se não houver empréstimos/reservas)"
                    className="h-9 sm:h-8 w-9 sm:w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        /* Visualização em Tabela */
        <Card>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Capa</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead className="text-center">Exemplares</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Histórico</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow 
                  key={book.id} 
                  className={`hover:bg-gray-50 ${
                    hasUserBorrowedBook(book.id) || (canManageBooks() && hasBookBeenBorrowed(book.id))
                      ? 'bg-blue-50/30' 
                      : ''
                  }`}
                >
                  <TableCell>
                    <div className="w-12 h-16 rounded overflow-hidden">
                      <BookCover
                        src={book.cover_image}
                        alt={`Capa do livro ${book.title}`}
                        className="w-full h-full object-cover rounded"
                        fallbackClassName="w-full h-full rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{book.title}</div>
                    {book.number && (
                      <div className="text-xs text-gray-500 mt-1">
                        📋 Tombo: {book.number}
                      </div>
                    )}
                    {book.synopsis && (
                      <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {book.synopsis}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {book.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{book.isbn || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">{book.available_copies || 0}/{book.total_copies || 0}</div>
                      <div className="text-xs text-gray-500">disp./total</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getAvailabilityBadge(book)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserHistoryBadge(book)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {book.total_copies === 0 ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled
                          className="h-8 px-3"
                        >
                          Indisponível
                        </Button>
                      ) : book.is_available ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleReserveBook(book)}
                          disabled={reservingBook === book.id}
                          className="h-8 px-3"
                        >
                          {reservingBook === book.id ? 'Emprestando...' : 'Emprestar'}
                        </Button>
                      ) : (
                        (() => {
                          const userPosition = getUserPosition(book.id)
                          const queue = getBookQueue(book.id)
                          
                          if (userPosition) {
                            return (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                disabled
                                className="h-8 px-3"
                              >
                                Fila (pos. {userPosition})
                              </Button>
                            )
                          }
                          
                          return (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReserveBook(book)}
                              disabled={reservingBook === book.id}
                              className="h-8 px-3"
                            >
                              {reservingBook === book.id ? 'Entrando...' : `Entrar na Fila${queue?.total_waiting ? ` (${queue.total_waiting + 1}º)` : ''}`}
                            </Button>
                          )
                        })()
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingBook(book)}
                        title={canManageBooks() ? 'Editar livro' : 'Ver detalhes'}
                        className="h-8 w-8 p-0"
                      >
                        {canManageBooks() ? (
                          <Edit className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      {canManageBooks() && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteBook(book)}
                          title="Excluir livro (apenas se não houver empréstimos/reservas)"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
      )}

      {!isLoading && books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum livro encontrado</p>
          <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* Book History Modal */}
      <Modal open={!!showingHistoryFor} onOpenChange={() => setShowingHistoryFor(null)}>
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {canManageBooks() ? 'Histórico do Livro' : 'Seu Histórico de Leitura'}
            </ModalTitle>
            <ModalDescription>
              {canManageBooks() 
                ? 'Histórico completo de empréstimos deste livro'
                : 'Detalhes dos seus empréstimos deste livro'
              }
            </ModalDescription>
          </ModalHeader>
          {showingHistoryFor && (() => {
            const book = books.find(b => b.id === showingHistoryFor)
            const userStats = getUserBookStats(showingHistoryFor)
            const generalStats = getBookGeneralStats(showingHistoryFor)
            const isAdmin = canManageBooks()
            
            const userLoans = loans.filter(loan => 
              loan.book_id === showingHistoryFor && 
              loan.user_id === user?.id
            ).sort((a, b) => 
              new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
            )
            
            const allBookLoans = loans.filter(loan => 
              loan.book_id === showingHistoryFor
            ).sort((a, b) => 
              new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
            )
            
            if (!book) return null
            
            return (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-16 rounded overflow-hidden">
                    <BookCover
                      src={book.cover_image}
                      alt={`Capa do livro ${book.title}`}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    {book.number && (
                      <p className="text-xs text-gray-500 mt-1">📋 Tombo: {book.number}</p>
                    )}
                  </div>
                </div>
                
                {/* Resumo Geral (para admins) */}
                {isAdmin && generalStats && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">📊 Estatísticas Gerais</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Total de empréstimos:</span>
                        <span className="font-medium ml-1">{generalStats.totalBorrows}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Usuários únicos:</span>
                        <span className="font-medium ml-1">{generalStats.uniqueUsers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Atualmente emprestado:</span>
                        <span className={`font-medium ml-1 ${
                          generalStats.isCurrentlyBorrowed ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {generalStats.isCurrentlyBorrowed ? `Sim (${generalStats.currentlyBorrowed})` : 'Não'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Último empréstimo:</span>
                        <span className="font-medium ml-1">
                          {formatLastBorrowDate(generalStats.lastBorrowDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Resumo Pessoal */}
                {userStats && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      {isAdmin ? '👤 Seus Empréstimos' : '📊 Resumo'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Seus empréstimos:</span>
                        <span className="font-medium ml-1">{userStats.totalBorrows}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status atual:</span>
                        <span className={`font-medium ml-1 ${
                          userStats.isCurrentlyBorrowed ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {userStats.isCurrentlyBorrowed ? 'Emprestado' : 'Devolvido'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Histórico Completo (para admins) ou Pessoal (para usuários) */}
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    {isAdmin ? '📋 Histórico Completo' : '📋 Histórico de Empréstimos'}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(isAdmin ? allBookLoans : userLoans).map((loan, index) => (
                      <div key={loan.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <div className="font-medium">
                            {index === 0 ? 'Mais recente' : `${index + 1}º empréstimo`}
                            {isAdmin && loan.user_id !== user?.id && (
                              <span className="text-blue-600 ml-1">(outro usuário)</span>
                            )}
                          </div>
                          <div className="text-gray-600">
                            {new Date(loan.borrowed_at).toLocaleDateString('pt-BR')}
                            {loan.returned_at && (
                              <span> - {new Date(loan.returned_at).toLocaleDateString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'returned' 
                            ? 'bg-green-100 text-green-800' 
                            : loan.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {loan.status === 'returned' ? 'Devolvido' : 
                           loan.status === 'active' ? 'Ativo' : 'Atrasado'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mensagem quando admin não tem histórico pessoal */}
                {isAdmin && !userStats && generalStats && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 Você não emprestou este livro, mas ele foi emprestado {generalStats.totalBorrows} vez(es) por outros usuários.
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </ModalContent>
      </Modal>

      {/* Paginação */}
      {booksData && booksData.total > 0 && (
        <Pagination
          currentPage={booksData.current_page}
          lastPage={booksData.last_page}
          total={booksData.total}
          perPage={booksData.per_page}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Book Modal */}
      <Modal open={showCreateForm} onOpenChange={setShowCreateForm}>
        <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>Novo Livro</ModalTitle>
            <ModalDescription>
              Adicione um novo livro ao catálogo da biblioteca
            </ModalDescription>
          </ModalHeader>
          <BookForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </ModalContent>
      </Modal>

      {/* Edit Book Modal */}
      <Modal open={!!editingBook} onOpenChange={() => setEditingBook(null)}>
        <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {canManageBooks() ? 'Editar Livro' : 'Detalhes do Livro'}
            </ModalTitle>
            <ModalDescription>
              {canManageBooks() 
                ? 'Atualize as informações do livro' 
                : 'Visualize as informações detalhadas do livro'
              }
            </ModalDescription>
          </ModalHeader>
          {editingBook && (
            <BookForm
              book={editingBook}
              onSuccess={() => setEditingBook(null)}
              onCancel={() => setEditingBook(null)}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Import CSV Modal */}
      <Modal open={showImportForm} onOpenChange={setShowImportForm}>
        <ModalContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Importar Livros via CSV</ModalTitle>
            <ModalDescription>
              Importe múltiplos livros de uma vez usando um arquivo CSV
            </ModalDescription>
          </ModalHeader>
          <SimpleBookImport
            onSuccess={() => setShowImportForm(false)}
            onCancel={() => setShowImportForm(false)}
          />
        </ModalContent>
      </Modal>

    </div>
  )
}