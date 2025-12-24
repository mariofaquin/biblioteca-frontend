import { useState, useEffect } from 'react'
import { booksService } from '@/lib/services/books'

export function useCategories() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const result = await booksService.getCategories()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { data, isLoading, error }
}
