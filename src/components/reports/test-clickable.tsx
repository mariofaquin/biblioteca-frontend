'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function TestClickable() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    console.log('🔥 Clique detectado no card:', id)
    setExpanded(expanded === id ? null : id)
  }

  const testData = [
    { id: '1', title: 'Teste 1', description: 'Primeiro card de teste' },
    { id: '2', title: 'Teste 2', description: 'Segundo card de teste' }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🧪 Teste de Cards Clicáveis</h2>
      
      {testData.map((item) => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          {/* Card Principal */}
          <div 
            className="p-4 bg-white hover:bg-gray-100 cursor-pointer border-2 border-blue-300"
            onClick={() => toggleExpanded(item.id)}
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-sm text-blue-600">Clique para expandir</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert(`Botão do ${item.title} clicado!`)
                  }}
                >
                  Ação
                </Button>
                
                {expanded === item.id ? (
                  <ChevronUp className="h-6 w-6 text-blue-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          {/* Seção Expandida */}
          {expanded === item.id && (
            <div className="bg-blue-50 p-4 border-t">
              <h4 className="font-semibold mb-2">✅ Detalhes Expandidos</h4>
              <p className="text-sm text-gray-700">
                Este é o conteúdo expandido do {item.title}. 
                Se você está vendo isso, significa que o clique funcionou!
              </p>
              <div className="mt-3 p-3 bg-green-100 rounded">
                <p className="text-green-800 font-medium">
                  🎉 Sucesso! O card {item.id} foi expandido corretamente.
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">📋 Instruções de Teste:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Clique nos cards para expandir/contrair</li>
          <li>• O botão &quot;Ação&quot; não deve expandir o card</li>
          <li>• Observe os logs no console (F12)</li>
          <li>• As setas devem mudar de direção</li>
        </ul>
      </div>
    </div>
  )
}