'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserCompaniesManager } from '@/components/users/user-companies-manager'
import { ArrowLeft } from 'lucide-react'

export default function UserCompaniesPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      const response = await fetch(`http://localhost:8003/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.data || data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Usuário não encontrado</p>
        <Button onClick={() => router.push('/users')} className="mt-4">
          Voltar para Usuários
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/users')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Empresas
          </h1>
          <p className="text-gray-600 mt-1">
            Usuário: <strong>{user.name}</strong> ({user.email})
          </p>
        </div>
      </div>

      <UserCompaniesManager userId={userId} userName={user.name} />
    </div>
  )
}
