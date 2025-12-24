"use client"

import { useState } from 'react'

export function RadixTest() {
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  if (typeof window === 'undefined') {
    return <div>Carregando...</div>
  }

  if (!mounted) {
    setTimeout(() => setMounted(true), 100)
    return <div>Inicializando componentes...</div>
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Teste de Componentes Radix</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Botão Simples:</h4>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Teste
          </button>
        </div>

        <div>
          <h4 className="font-semibold">Classes CSS:</h4>
          <div className="p-2 bg-gray-100 rounded">
            Teste de classes Tailwind
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Estado:</h4>
          <p>Componente montado: {mounted ? 'Sim' : 'Não'}</p>
        </div>
      </div>
    </div>
  )
}