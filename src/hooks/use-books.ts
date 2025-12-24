'use client'

import { useState, useEffect } from 'react'
import { booksService, BooksFilters, CreateBookData, UpdateBookData } from '@/lib/services/books'
import { useToast } from '@/hooks/use-toast'

export function useBooks(filters: BooksFilters = {}) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true)
        const result = await booksService.getBooks(filters)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [JSON.stringify(filters)])

  return { data, isLoading, error }
}

export function useBook(id: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        setIsLoading(true)
        const result = await booksService.getBook(id)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [id])

  return { data, isLoading, error }
}

export function useCreateBook() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data: CreateBookData) => {
    try {
      setIsLoading(true)
      console.log('🚀 Tentando criar livro:', data)
      const result = await booksService.createBook(data)
      console.log('✅ Livro criado com sucesso:', result)
      // Limpar cache para forçar atualização
      booksService.clearCache()
      toast({
        title: 'Sucesso',
        description: result.message || 'Livro criado com sucesso',
      })
      return result
    } catch (error: any) {
      console.error('❌ Erro ao criar livro:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao criar livro',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useUpdateBook() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }: { id: string; data: UpdateBookData }) => {
    try {
      setIsLoading(true)
      const result = await booksService.updateBook(id, data)
      toast({
        title: 'Sucesso',
        description: result.message || 'Livro atualizado com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao atualizar livro',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useDeleteBook() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    try {
      setIsLoading(true)
      console.log('🗑️ Tentando excluir livro:', id)
      const result = await booksService.deleteBook(id)
      console.log('✅ Livro excluído com sucesso:', result)
      toast({
        title: '✅ Livro Excluído',
        description: result.message || 'Livro removido com sucesso',
      })
      return result
    } catch (error: any) {
      console.error('❌ Erro ao excluir livro:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao remover livro'
      const errorReason = error.response?.data?.reason
      const suggestion = error.response?.data?.suggestion
      
      // Mostrar mensagem clara
      alert(`❌ ${errorMessage}\n\n${errorReason || ''}\n\n💡 Dica: Edite o livro e marque "Exemplares Disponíveis" como 0 para inativá-lo.`)
      
      toast({
        title: '❌ Não foi possível excluir',
        description: errorReason || errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}