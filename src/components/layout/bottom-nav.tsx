'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Home,
  Users,
  BookOpen,
  FileText,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Usuários', path: '/users', icon: Users },
    { name: 'Livros', path: '/books', icon: BookOpen },
    { name: 'Empréstimos', path: '/loans', icon: FileText },
    { name: 'Relatórios', path: '/reports', icon: BarChart3 },
  ]

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center p-2 h-auto ${
              isActive(item.path) 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}