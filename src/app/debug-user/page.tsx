'use client'

import { useAuth } from '@/hooks/use-auth'
import { useCompany } from '@/hooks/use-company'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Copy, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function DebugUserPage() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Usuário não logado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">🔍 Debug - Informações do Usuário</h1>
        <p className="text-gray-600 mt-2">
          Informações detalhadas para debug de empréstimos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">UUID (ID)</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                  {user.id}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(user.id, 'UUID')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {copied === 'UUID' && (
                <p className="text-xs text-green-600 mt-1">✅ UUID copiado!</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user.email || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user.role}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Is Root</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">
                {(user as any).is_root ? 'Sim' : 'Não'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>🏢 Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCompany ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">UUID da Empresa</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                      {selectedCompany.id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(selectedCompany.id, 'Company UUID')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {copied === 'Company UUID' && (
                    <p className="text-xs text-green-600 mt-1">✅ UUID da empresa copiado!</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Nome da Empresa</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded">{selectedCompany.name}</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Nenhuma empresa selecionada</p>
            )}
          </CardContent>
        </Card>

        {/* LocalStorage Debug */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>💾 LocalStorage Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Dados do Usuário (localStorage)</label>
                <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              {selectedCompany && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dados da Empresa (localStorage)</label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedCompany, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug do Usuário no Banco */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🔍 Verificar Usuário no Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/api/debug-user/${user.id}`, '_blank')}
                className="w-full"
              >
                🔍 Verificar se este usuário existe no banco
              </Button>
              <p className="text-sm text-gray-600">
                Isso vai mostrar se o usuário existe no banco, qual empresa está associada, 
                e listar todos os usuários disponíveis se não encontrar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Teste de APIs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🧪 Teste Rápido de APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                onClick={() => window.open('/api/health', '_blank')}
              >
                Testar /api/health
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/api/users', '_blank')}
              >
                Testar /api/users
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/api/loans', '_blank')}
              >
                Testar /api/loans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}