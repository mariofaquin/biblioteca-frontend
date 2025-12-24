'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  token: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    console.log('🚪 [useAuth] Iniciando logout completo...')
    
    // Limpar estado do usuário
    setUser(null)
    
    // Limpar todos os dados do localStorage relacionados à sessão
    localStorage.removeItem('user')
    localStorage.removeItem('selected_company')
    localStorage.removeItem('user_reservations')
    localStorage.removeItem('auth_token')
    
    // Limpar outros caches que possam existir
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('user_') || 
        key.startsWith('company_') || 
        key.startsWith('auth_') ||
        key.startsWith('session_')
      )) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🧹 [useAuth] Removido: ${key}`)
    })
    
    // Limpar cache do React Query se disponível
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      const queryClient = (window as any).queryClient
      queryClient.clear()
      console.log('🔄 [useAuth] Cache do React Query limpo')
    }
    
    console.log('✅ [useAuth] Logout completo realizado')
  }

  const isAuthenticated = !!user

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}