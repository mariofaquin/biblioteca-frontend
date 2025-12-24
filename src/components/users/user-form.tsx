'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/simple-select'
import { ModalFooter } from '@/components/ui/simple-modal'
import { useCreateUser, useUpdateUser } from '@/hooks/use-users'
import { CreateUserData, UpdateUserData } from '@/lib/services/users'
import { usePermissions } from '@/hooks/use-permissions'
import { useCompanies } from '@/hooks/use-companies'

interface UserFormProps {
  user?: any
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(user?.company_id)
  
  const { isRoot } = usePermissions()
  const { data: companiesData, isLoading: isLoadingCompanies, error: companiesError } = useCompanies({ per_page: 100 })
  
  // Debug: Log companies data
  useEffect(() => {
    console.log('🔍 Debug empresas:', {
      companiesData,
      hasData: !!companiesData,
      dataArray: companiesData?.data,
      dataLength: companiesData?.data?.length,
      isLoading: isLoadingCompanies,
      error: companiesError
    })
    if (companiesData) {
      console.log('📊 Empresas carregadas:', companiesData)
      console.log('📊 Array de empresas:', companiesData.data)
    }
    if (companiesError) {
      console.error('❌ Erro ao carregar empresas:', companiesError)
    }
  }, [companiesData, companiesError, isLoadingCompanies])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserData | UpdateUserData>({
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    } : {
      name: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true,
    }
  })

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  const role = watch('role')
  const isActive = watch('is_active')

  const onSubmit = async (data: CreateUserData | UpdateUserData) => {
    try {
      // Adicionar company_id se Root selecionou uma empresa
      const enrichedData = {
        ...data,
        ...(isRoot() && selectedCompanyId ? { company_id: selectedCompanyId } : {})
      }
      
      if (isEditing && user) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: enrichedData as UpdateUserData
        })
      } else {
        await createUserMutation.mutateAsync(enrichedData as CreateUserData)
      }
      onSuccess()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          {...register('name', { 
            required: 'Nome é obrigatório',
            maxLength: { value: 255, message: 'Nome deve ter no máximo 255 caracteres' }
          })}
          placeholder="Digite o nome completo"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          placeholder="Digite o email"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {isEditing ? 'Nova Senha (opcional)' : 'Senha'}
        </Label>
        <Input
          id="password"
          type="password"
          {...register('password', isEditing ? {} : { 
            required: 'Senha é obrigatória',
            minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
          })}
          placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Digite a senha'}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <Select
          value={role}
          onValueChange={(value) => setValue('role', value as 'admin' | 'user')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Campo de empresa - apenas para Root */}
      {isRoot() && (
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          {isLoadingCompanies ? (
            <div className="text-sm text-muted-foreground">Carregando empresas...</div>
          ) : companiesError ? (
            <div className="text-sm text-red-600">Erro ao carregar empresas</div>
          ) : (
            <Select
              value={selectedCompanyId || 'none'}
              onValueChange={(value) => setSelectedCompanyId(value === 'none' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma empresa</SelectItem>
                {companiesData?.data && companiesData.data.length > 0 && (
                  companiesData.data.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            {companiesData?.data && companiesData.data.length > 0
              ? `${companiesData.data.length} empresa(s) disponível(is)`
              : 'Root pode criar usuários sem empresa ou vinculá-los a qualquer empresa'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="is_active">Status</Label>
        <Select
          value={isActive ? 'true' : 'false'}
          onValueChange={(value) => setValue('is_active', value === 'true')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || createUserMutation.isPending || updateUserMutation.isPending}
        >
          {isSubmitting || createUserMutation.isPending || updateUserMutation.isPending
            ? (isEditing ? 'Atualizando...' : 'Criando...')
            : (isEditing ? 'Atualizar' : 'Criar')
          }
        </Button>
      </ModalFooter>
    </form>
  )
}