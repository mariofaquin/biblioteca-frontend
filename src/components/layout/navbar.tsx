'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { SyncStatus } from '@/components/ui/sync-status'
import { SimpleCompanyDropdown } from '@/components/auth/simple-company-dropdown'
import { UserPermissionsBadge } from '@/components/layout/user-permissions-badge'
import { ModeIndicator } from '@/components/ui/mode-indicator'
import { useCompany } from '@/hooks/use-company'
import { Settings, Database, ChevronDown, Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const { selectedCompany } = useCompany()
  const [showConfigMenu, setShowConfigMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    console.log('🚪 [Navbar] Botão sair clicado')
    
    try {
      // Executar logout
      logout()
      
      // Aguardar um pouco para garantir que o logout foi processado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Navegar para login
      console.log('🔄 [Navbar] Redirecionando para login...')
      router.push('/login')
      
      // Fallback: forçar redirecionamento se router não funcionar
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          console.log('🔄 [Navbar] Fallback: usando window.location')
          window.location.href = '/login'
        }
      }, 500)
      
    } catch (error) {
      console.error('❌ [Navbar] Erro no logout:', error)
      // Forçar redirecionamento mesmo com erro
      window.location.href = '/login'
    }
  }

  const handleNavigation = (path: string) => {
    setShowMobileMenu(false)
    router.push(path)
  }

  const getNavbarTitle = () => {
    // Se é ROOT ou não tem empresa selecionada, mostrar nome genérico
    if ((user as any)?.is_root && !selectedCompany) {
      return 'Biblioteca Multiempresa'
    }
    
    // Se tem empresa selecionada, mostrar nome da empresa
    if (selectedCompany?.name) {
      return selectedCompany.name
    }
    
    // Se tem empresa no usuário, mostrar nome da empresa
    if ((user as any)?.company_name) {
      return (user as any).company_name
    }
    
    // Fallback para nome genérico
    return 'Biblioteca Multiempresa'
  }

  if (!user) return null

  return (
    <>
      <ModeIndicator />
      <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <span className="text-white font-bold text-sm">📚</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getNavbarTitle()}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserPermissionsBadge />
            
            {/* Debug: User UUID */}
            <div 
              className="hidden sm:block bg-yellow-50 border border-yellow-200 rounded px-2 py-1 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => router.push('/debug-user')}
              title="Clique para ver informações completas de debug"
            >
              <div className="text-xs text-yellow-800">
                <div className="font-mono">ID: {user.id?.substring(0, 8)}...</div>
                <div className="font-semibold">{user.name}</div>
              </div>
            </div>
            
            <SyncStatus />
            <SimpleCompanyDropdown />
            

            
            {/* Desktop Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden lg:inline-flex"
            >
              Sair
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white relative z-50">
          <div className="px-4 py-2 space-y-1">
            
            {/* Debug: User Info Mobile */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
              <div className="text-xs text-yellow-800">
                <div className="font-semibold mb-1">{user.name}</div>
                <div className="font-mono text-xs">UUID: {user.id}</div>
                <div className="text-xs">Role: {user.role}</div>
                {user.email && <div className="text-xs">Email: {user.email}</div>}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  router.push('/debug-user')
                  setShowMobileMenu(false)
                }}
                className="w-full mt-2 text-xs"
              >
                Ver Debug Completo
              </Button>
            </div>

            
            {/* Settings for admin/root */}
            {(user.role === 'root' || user.role === 'admin') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/settings')
                    setShowMobileMenu(false)
                  }}
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações da Empresa
                </Button>
                {user.role === 'root' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/admin/db-config')
                      setShowMobileMenu(false)
                    }}
                    className="w-full justify-start text-orange-600"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Banco de Dados
                  </Button>
                )}
                <div className="border-t border-gray-100 my-2"></div>
              </>
            )}

            {/* Logout */}
            <div className="border-t border-gray-100 my-2"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              Sair
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop to close menus when clicking outside */}
      {(showConfigMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowConfigMenu(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </nav>
    </>
  )
}