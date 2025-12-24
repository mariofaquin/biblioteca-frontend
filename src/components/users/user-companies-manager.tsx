'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { userCompaniesService, UserCompany } from '@/lib/services/user-companies'
import { Building2, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserCompaniesManagerProps {
  userId: string
  userName: string
}

interface Company {
  id: string
  name: string
  slug: string
}

export function UserCompaniesManager({ userId, userName }: UserCompaniesManagerProps) {
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Buscar empresas do usuário
      const userCompaniesData = await userCompaniesService.getUserCompanies(userId)
      setUserCompanies(userCompaniesData.data)
      
      // Buscar todas as empresas
      const response = await fetch('http://localhost:8003/api/companies')
      if (response.ok) {
        const result = await response.json()
        const companiesData = result.data || result
        setAllCompanies(Array.isArray(companiesData) ? companiesData : [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = async () => {
    if (!selectedCompanyId) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma empresa',
        variant: 'destructive'
      })
      return
    }

    try {
      setAdding(true)
      
      await userCompaniesService.addUserToCompany(userId, {
        company_id: selectedCompanyId,
        role: selectedRole
      })
      
      toast({
        title: 'Sucesso',
        description: 'Usuário vinculado à empresa com sucesso'
      })
      
      setSelectedCompanyId('')
      setSelectedRole('user')
      loadData()
    } catch (error: any) {
      console.error('Erro ao adicionar empresa:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao vincular usuário',
        variant: 'destructive'
      })
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveCompany = async (companyId: string, companyName: string) => {
    if (userCompanies.length <= 1) {
      toast({
        title: 'Atenção',
        description: 'Não é possível remover a última empresa do usuário',
        variant: 'destructive'
      })
      return
    }

    if (!confirm(`Tem certeza que deseja desvincular ${userName} da empresa ${companyName}?`)) {
      return
    }

    try {
      await userCompaniesService.removeUserFromCompany(userId, companyId)
      
      toast({
        title: 'Sucesso',
        description: 'Usuário desvinculado da empresa com sucesso'
      })
      
      loadData()
    } catch (error: any) {
      console.error('Erro ao remover empresa:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao desvincular usuário',
        variant: 'destructive'
      })
    }
  }

  // Filtrar empresas disponíveis (que o usuário ainda não está vinculado)
  const availableCompanies = allCompanies.filter(
    company => !userCompanies.some(uc => uc.id === company.id)
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Empresas Vinculadas
        </CardTitle>
        <CardDescription>
          Gerencie as empresas que {userName} tem acesso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de empresas vinculadas */}
        <div className="space-y-2">
          {userCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhuma empresa vinculada</p>
            </div>
          ) : (
            userCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{company.name}</span>
                    <Badge variant={company.role === 'admin' ? 'default' : 'secondary'}>
                      {company.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </div>
                  {company.description && (
                    <p className="text-sm text-gray-500 mt-1 ml-6">{company.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCompany(company.id, company.name)}
                  disabled={userCompanies.length <= 1}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Adicionar nova empresa */}
        {availableCompanies.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Adicionar Nova Empresa</h4>
            <div className="flex gap-2">
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {availableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(value: 'admin' | 'user') => setSelectedRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddCompany} disabled={adding || !selectedCompanyId}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {availableCompanies.length === 0 && userCompanies.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            Usuário já está vinculado a todas as empresas disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  )
}
