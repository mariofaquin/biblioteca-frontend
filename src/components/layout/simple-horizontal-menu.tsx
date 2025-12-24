'use client'

import { useRouter, usePathname } from 'next/navigation'

export function SimpleHorizontalMenu() {
  const router = useRouter()
  const pathname = usePathname()

  console.log('🔥 [SimpleHorizontalMenu] Componente renderizado')
  console.log('🔥 [SimpleHorizontalMenu] Pathname atual:', pathname)

  const handleNavigation = (path: string, label: string) => {
    console.log(`🚀 [SimpleHorizontalMenu] Clicou em: ${label} -> ${path}`)
    console.log('🚀 [SimpleHorizontalMenu] Tentando navegar...')
    
    try {
      router.push(path)
      console.log('✅ [SimpleHorizontalMenu] Navegação executada')
    } catch (error) {
      console.error('❌ [SimpleHorizontalMenu] Erro:', error)
    }
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Biblioteca', path: '/books', icon: '📚' },
    { label: 'Empréstimos', path: '/loans', icon: '📅' },
    { label: 'Usuários', path: '/users', icon: '👥' },
    { label: 'Relatórios', path: '/reports', icon: '📊' },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb', 
      padding: '8px 24px' 
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        overflowX: 'auto' 
      }}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path, item.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isActive(item.path) ? '#dbeafe' : 'transparent',
              color: isActive(item.path) ? '#1d4ed8' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.color = '#111827'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}