import { useState, useEffect } from 'react'
import { companySettingsService, UpdateCompanySettingsData } from '@/lib/services/company-settings'
import { useToast } from '@/hooks/use-toast'

// Hook para buscar configurações da empresa
export function useCompanySettings() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const result = await companySettingsService.getSettings()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { data, isLoading, error }
}

// Hook para atualizar configurações
export function useUpdateCompanySettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data: UpdateCompanySettingsData) => {
    try {
      setIsLoading(true)
      const result = await companySettingsService.updateSettings(data)
      toast({
        title: 'Sucesso!',
        description: result.message || 'Configurações atualizadas com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar configurações',
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

// Hook para resetar configurações para padrão
export function useResetCompanySettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async () => {
    try {
      setIsLoading(true)
      const result = await companySettingsService.resetToDefaults()
      toast({
        title: 'Sucesso!',
        description: result.message || 'Configurações resetadas com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar configurações',
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