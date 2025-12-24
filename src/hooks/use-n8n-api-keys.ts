import { useState, useEffect } from 'react'
import { n8nApiKeysService, CreateN8NApiKeyData } from '@/lib/services/n8n-api-keys'
import { useToast } from '@/hooks/use-toast'

// Hook para listar API Keys
export function useN8NApiKeys() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setIsLoading(true)
        const result = await n8nApiKeysService.listApiKeys()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  return { data, isLoading, error }
}

// Hook para criar API Key
export function useCreateN8NApiKey() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data: CreateN8NApiKeyData) => {
    try {
      setIsLoading(true)
      const result = await n8nApiKeysService.createApiKey(data)
      toast({
        title: 'Sucesso!',
        description: 'API Key criada com sucesso. Copie agora, ela não será mostrada novamente!',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao criar API Key',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

// Hook para revogar API Key
export function useRevokeN8NApiKey() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    try {
      setIsLoading(true)
      const result = await n8nApiKeysService.revokeApiKey(id)
      toast({
        title: 'Sucesso',
        description: 'API Key revogada com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao revogar API Key',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}
