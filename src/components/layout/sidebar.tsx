'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Home,
  Users,
  BookOpen,
  FileText,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Usuários', path: '/users', icon: Users },
    { name: 'Livros', path: '/books', icon: BookOpen },
    { name: 'Empréstimos', path: '/loans', icon: FileText },
    { name: 'Financeiro', path: '/financial', icon: DollarSign },
    { name: 'Relatórios', path: '/reports', icon: BarChart3 },
  ]

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(item.path)}
              className="w-full justify-start"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}