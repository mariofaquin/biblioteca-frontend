import { useState, useEffect } from 'react'
import { booksService } from '@/lib/services/books'

export function useCategories() {
  const [data, setData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const result = await booksService.getCategories()
        setData(result || [])
        setError(null)
      } catch (err) {
        setError(err)
        setData([]) // Retornar array vazio em caso de erro
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { data, isLoading, error }
}
