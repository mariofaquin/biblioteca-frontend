'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  requiredPermission?: 'admin' | 'root'
}

export function HorizontalMenu() {
  const router = useRouter()
  const pathname = usePathname()
  
  let permissions = {
    isAdmin: () => false,
    isRoot: () => false,
    canViewOtherUsers: () => false,
    canManageBooks: () => false,
    canViewReports: () => false
  }
  
  try {
    const permissionsHook = usePermissions()
    permissions = {
      isAdmin: permissionsHook.isAdmin,
      isRoot: permissionsHook.isRoot,
      canViewOtherUsers: permissionsHook.canViewOtherUsers,
      canManageBooks: permissionsHook.canManageBooks,
      canViewReports: permissionsHook.canViewReports
    }
  } catch (error) {
    console.error('❌ [HorizontalMenu] Erro ao carregar permissões:', error)
    // Usar permissões padrão (todas false)
  }

  // Log apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 [HorizontalMenu] Renderizado - Pathname:', pathname)
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      path: '/dashboard'
    },
    {
      id: 'books',
      label: 'Biblioteca',
      icon: <BookOpen className="w-4 h-4" />,
      path: '/books'
    },
    {
      id: 'loans',
      label: 'Empréstimos',
      icon: <Calendar className="w-4 h-4" />,
      path: '/loans'
    }
  ]

  // Adicionar itens condicionais baseados nas permissões
  if (permissions.canViewOtherUsers()) {
    menuItems.push({
      id: 'users',
      label: 'Usuários',
      icon: <Users className="w-4 h-4" />,
      path: '/users'
    })
  }

  if (permissions.canViewReports()) {
    menuItems.push({
      id: 'reports',
      label: 'Relatórios',
      icon: <BarChart3 className="w-4 h-4" />,
      path: '/reports'
    })
  }

  if (permissions.isAdmin() || permissions.isRoot()) {
    menuItems.push({
      id: 'financial',
      label: 'Financeiro',
      icon: <DollarSign className="w-4 h-4" />,
      path: '/financial'
    })
  }

  if (permissions.isAdmin() || permissions.isRoot()) {
    menuItems.push({
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
      path: '/settings'
    })
  }

  const handleNavigation = (path: string) => {
    try {
      // Tentar primeiro com router.push
      router.push(path)
      
      // Fallback com window.location se router não funcionar
      setTimeout(() => {
        if (window.location.pathname !== path) {
          window.location.href = path
        }
      }, 100)
      
    } catch (error) {
      // Fallback direto se houver erro
      window.location.href = path
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(path)
  }



  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${isActive(item.path)
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          

        </div>
      </div>
      
      {/* Estilo para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  )
}