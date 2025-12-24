'use client'

import { useState, useEffect } from 'react'
import { usersService, UsersFilters, CreateUserData, UpdateUserData } from '@/lib/services/users'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'

export function useUsers(additionalFilters: UsersFilters = {}) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const { getDataFilters, canViewOtherUsers } = usePermissions()
  
  const permissionFilters = getDataFilters()
  const combinedFilters = {
    ...additionalFilters,
    company_id: permissionFilters.company_id,
    scope: permissionFilters.scope,
  }

  useEffect(() => {
    if (!canViewOtherUsers()) {
      setData({ data: [], total: 0 })
      setIsLoading(false)
      return
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const result = await usersService.getUsers(combinedFilters)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [JSON.stringify(combinedFilters), canViewOtherUsers()])

  return { data, isLoading, error }
}

export function useUser(id: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const result = await usersService.getUser(id)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  return { data, isLoading, error }
}

export function useCreateUser() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data: CreateUserData) => {
    try {
      setIsLoading(true)
      const result = await usersService.createUser(data)
      toast({
        title: 'Sucesso',
        description: result.message || 'Usuário criado com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao criar usuário',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useUpdateUser() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }: { id: string; data: UpdateUserData }) => {
    try {
      setIsLoading(true)
      const result = await usersService.updateUser(id, data)
      toast({
        title: 'Sucesso',
        description: result.message || 'Usuário atualizado com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao atualizar usuário',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useDeleteUser() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    try {
      setIsLoading(true)
      const result = await usersService.deleteUser(id)
      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useRestoreUser() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    try {
      setIsLoading(true)
      const result = await usersService.restoreUser(id)
      toast({
        title: 'Sucesso',
        description: result.message || 'Usuário restaurado com sucesso',
      })
      return result
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao restaurar usuário',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

// Hook para verificar informações de exclusão
export function useUserDeletionInfo(userId: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchInfo = async () => {
      try {
        setIsLoading(true)
        const result = await usersService.getUserDeletionInfo(userId)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfo()
  }, [userId])

  return { data, isLoading, error }
}