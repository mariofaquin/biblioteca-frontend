'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, RotateCcw, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/simple-modal'
import { useUsers, useDeleteUser, useRestoreUser, useUserDeletionInfo } from '@/hooks/use-users'
import { UserForm } from './user-form'
import { useToast } from '@/hooks/use-toast'

export function UserList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'admin' | 'user' | 'all'>('all')
  const [page, setPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)
  const { toast } = useToast()

  const { data: usersData, isLoading } = useUsers({
    search: search || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    page,
    per_page: 15,
  })

  const deleteUserMutation = useDeleteUser()
  const restoreUserMutation = useRestoreUser()
  
  // Buscar informações de exclusão quando um usuário é selecionado
  const { data: deletionInfo } = useUserDeletionInfo(deletingUser?.id || '')

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value as 'admin' | 'user' | 'all')
    setPage(1)
  }

  const handleDeleteUser = async () => {
    if (deletingUser) {
      try {
        const result = await deleteUserMutation.mutateAsync(deletingUser.id)
        
        // Mostrar toast com o resultado
        if (result.action === 'deleted') {
          toast({
            title: '🗑️ Usuário excluído',
            description: result.message,
            variant: 'default',
          })
        } else {
          toast({
            title: '⚠️ Usuário inativado',
            description: result.message,
            variant: 'default',
          })
        }
        
        setDeletingUser(null)
      } catch (error: any) {
        toast({
          title: '❌ Erro',
          description: error.response?.data?.error || 'Erro ao processar exclusão',
          variant: 'destructive',
        })
      }
    }
  }

  const handleRestoreUser = async (user: any) => {
    await restoreUserMutation.mutateAsync(user.id)
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
    }
    
    const labels = {
      admin: 'Administrador',
      user: 'Usuário',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários da sua empresa
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.data.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/users/${user.id}/companies`)}
                            title="Gerenciar Empresas"
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUser(user)}
                              title="Excluir/Inativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreUser(user)}
                              title="Reativar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usersData && usersData.data.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              )}

              {usersData && 'last_page' in usersData && usersData.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {usersData.data.length} de {usersData.total} usuários
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {page} de {usersData.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === usersData.last_page}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal open={showCreateForm} onOpenChange={setShowCreateForm}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Novo Usuário</ModalTitle>
            <ModalDescription>
              Crie um novo usuário para sua empresa
            </ModalDescription>
          </ModalHeader>
          <UserForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Editar Usuário</ModalTitle>
            <ModalDescription>
              Atualize as informações do usuário
            </ModalDescription>
          </ModalHeader>
          {editingUser && (
            <UserForm
              user={editingUser}
              onSuccess={() => setEditingUser(null)}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal with Smart Preview */}
      <Modal open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {deletionInfo?.recommended_action === 'delete' ? '🗑️ Confirmar Exclusão' : '⚠️ Confirmar Inativação'}
            </ModalTitle>
            <ModalDescription>
              <div className="space-y-3">
                <p>
                  Usuário: <strong>{deletingUser?.name}</strong> ({deletingUser?.email})
                </p>
                
                {deletionInfo ? (
                  <div className={`p-3 rounded-lg ${
                    deletionInfo.recommended_action === 'delete' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className="font-medium mb-2">
                      {deletionInfo.recommended_action === 'delete' 
                        ? '🗑️ Ação: Exclusão Permanente' 
                        : '⚠️ Ação: Inativação'}
                    </p>
                    <p className="text-sm">
                      {deletionInfo.message}
                    </p>
                    {deletionInfo.has_loans && (
                      <p className="text-sm mt-2 text-yellow-700">
                        💡 O usuário será inativado para preservar o histórico de empréstimos.
                      </p>
                    )}
                    {!deletionInfo.has_loans && (
                      <p className="text-sm mt-2 text-red-700">
                        ⚠️ O usuário será removido permanentemente do sistema.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm">Verificando informações...</span>
                  </div>
                )}
              </div>
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancelar
            </Button>
            <Button
              variant={deletionInfo?.recommended_action === 'delete' ? 'destructive' : 'default'}
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending || !deletionInfo}
            >
              {deleteUserMutation.isPending 
                ? 'Processando...' 
                : deletionInfo?.recommended_action === 'delete' 
                  ? 'Excluir Permanentemente' 
                  : 'Inativar Usuário'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}