'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react'

export default function ClearStoragePage() {
  const [isClearing, setIsClearing] = useState(false)
  const [cleared, setCleared] = useState(false)
  const router = useRouter()

  const clearAllStorage = () => {
    setIsClearing(true)
    
    try {
      // Limpar localStorage
      localStorage.clear()
      
      // Limpar sessionStorage
      sessionStorage.clear()
      
      // Limpar cookies (se houver)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      setCleared(true)
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao limpar storage:', error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">🧹 Limpar Dados do Navegador</h1>
        <p className="text-gray-600 mt-2">
          Remove todos os dados salvos localmente (localStorage, sessionStorage, cookies)
        </p>
      </div>

      <div className="grid gap-6">
        {/* Explicação */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">ℹ️ Por que limpar?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-4">Você precisa limpar os dados locais porque:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>🔄 <strong>Mudança de banco:</strong> Sistema agora usa banco remoto</li>
              <li>👤 <strong>Usuários diferentes:</strong> IDs antigos não existem mais</li>
              <li>🏢 <strong>Empresas diferentes:</strong> Estrutura de dados mudou</li>
              <li>🧹 <strong>Cache antigo:</strong> Dados inconsistentes salvos</li>
            </ul>
          </CardContent>
        </Card>

        {/* Dados Atuais */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Dados Atuais no Navegador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">LocalStorage Keys:</label>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                  {typeof window !== 'undefined' ? Object.keys(localStorage).join(', ') || 'Nenhuma' : 'Carregando...'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">SessionStorage Keys:</label>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                  {typeof window !== 'undefined' ? Object.keys(sessionStorage).join(', ') || 'Nenhuma' : 'Carregando...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Limpeza */}
        {!cleared ? (
          <Card>
            <CardHeader>
              <CardTitle>🧹 Limpar Todos os Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={clearAllStorage}
                disabled={isClearing}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    🧹 LIMPAR TODOS OS DADOS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Dados Limpos!</CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <p className="mb-4">Todos os dados foram removidos com sucesso!</p>
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold mb-2">🎯 Próximos Passos:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Você será redirecionado para o login</li>
                  <li>Faça login com: <code>admin@biblioteca.com</code> / <code>123456</code></li>
                  <li>Teste a importação e empréstimos</li>
                </ol>
              </div>
              <p className="mt-3 text-sm">Redirecionando em alguns segundos...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}