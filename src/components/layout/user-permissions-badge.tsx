'use client'

import { usePermissions } from '@/hooks/use-permissions'

export function UserPermissionsBadge() {
  const { user, selectedCompany, isUser, isAdmin, isRoot, getDataFilters } = usePermissions()
  
  if (!user) return null
  
  const filters = getDataFilters()
  
  const getRoleColor = () => {
    if (isRoot()) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (isAdmin()) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }
  
  const getRoleLabel = () => {
    if (isRoot()) return 'ROOT'
    if (isAdmin()) return 'ADMIN'
    return 'USER'
  }
  
  const getScopeLabel = () => {
    if (isRoot()) return 'Acesso total'
    if (isAdmin()) return 'Administrador'
    return 'Usuário básico'
  }
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`px-2 py-1 rounded-md border ${getRoleColor()}`}>
        <span className="font-medium">{getRoleLabel()}</span>
      </div>
      
      <div className="text-gray-600 text-xs">
        <span>{getScopeLabel()}</span>
      </div>
    </div>
  )
}