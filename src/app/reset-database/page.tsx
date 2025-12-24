'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Database, Trash2, Users, BookOpen, Building } from 'lucide-react'

export default function ResetDatabasePage() {
  const [isResetting, setIsResetting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleReset = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai APAGAR TODOS os dados do banco!\n\nTem certeza que deseja continuar?')) {
      return
    }

    if (!confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Todos os usuários, livros, empréstimos e empresas serão PERDIDOS!\n\nDigite OK para confirmar:')) {
      return
    }

    setIsResetting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão')
    } finally {
      setIsResetting(false)
    }
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
        <h1 className="text-3xl font-bold text-red-600">🗑️ Reset Completo do Banco de Dados</h1>
        <p className="text-gray-600 mt-2">
          ⚠️ Esta operação é IRREVERSÍVEL e apagará todos os dados!
        </p>
      </div>

      <div className="grid gap-6">
        {/* Aviso */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ ATENÇÃO - OPERAÇÃO PERIGOSA</CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">Esta operação vai:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>🗑️ <strong>Apagar TODAS as tabelas</strong> (users, books, loans, companies, reservations)</li>
              <li>💥 <strong>Perder TODOS os dados</strong> existentes</li>
              <li>🔄 <strong>Recriar as tabelas</strong> com estrutura correta</li>
              <li>👤 <strong>Criar usuários padrão</strong> (root, admin, user)</li>
              <li>📚 <strong>Inserir livros de exemplo</strong></li>
              <li>🏢 <strong>Criar empresa padrão</strong> com UUIDs corretos</li>
            </ul>
          </CardContent>
        </Card>

        {/* Botão de Reset */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Executar Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {isResetting ? (
                <>
                  <Database className="w-4 h-4 mr-2 animate-spin" />
                  Resetando Banco de Dados...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  🗑️ RESETAR BANCO DE DADOS
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Reset Concluído com Sucesso!</CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span><strong>{result.data.companies}</strong> Empresa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span><strong>{result.data.users}</strong> Usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span><strong>{result.data.books}</strong> Livros</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold mb-3">👤 Credenciais de Login:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div><strong>Root:</strong> {result.credentials.root.email} / {result.credentials.root.password}</div>
                  <div><strong>Admin:</strong> {result.credentials.admin.email} / {result.credentials.admin.password}</div>
                  <div><strong>User:</strong> {result.credentials.user.email} / {result.credentials.user.password}</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded text-blue-800">
                <h4 className="font-semibold">🎯 Próximos Passos:</h4>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Limpar cache do navegador (Ctrl+Shift+R)</li>
                  <li>Fazer logout se estiver logado</li>
                  <li>Fazer login com admin@biblioteca.com / 123456</li>
                  <li>Testar o empréstimo de livros</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erro */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">❌ Erro no Reset</CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}