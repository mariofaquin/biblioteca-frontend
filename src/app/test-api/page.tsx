'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCompaniesAPI = async () => {
    addResult('Testando API /api/companies...')
    
    try {
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        addResult('✅ API Companies funcionando!')
        addResult(`Dados: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        addResult(`❌ Erro na API (${response.status}): ${errorText}`)
      }
    } catch (error) {
      addResult(`❌ Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      console.error('Erro completo:', error)
    }
  }

  const testUsersAPI = async () => {
    addResult('Testando API /api/users...')
    
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult('✅ API Users funcionando!')
        addResult(`Dados: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        addResult(`❌ Erro na API Users (${response.status}): ${errorText}`)
      }
    } catch (error) {
      addResult(`❌ Erro na requisição Users: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      console.error('Erro completo:', error)
    }
  }

  const testBackendDirect = async () => {
    addResult('Testando backend direto...')
    
    try {
      const response = await fetch('http://localhost:8003/api/companies')
      
      if (response.ok) {
        const data = await response.json()
        addResult('✅ Backend direto funcionando!')
        addResult(`Dados: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        addResult(`❌ Erro no backend (${response.status}): ${errorText}`)
      }
    } catch (error) {
      addResult(`❌ Erro na requisição backend: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      console.error('Erro completo:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 Teste de APIs</h1>
      
      <div className="space-x-4 mb-6">
        <button 
          onClick={testCompaniesAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Testar /api/companies
        </button>
        
        <button 
          onClick={testUsersAPI}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Testar /api/users
        </button>
        
        <button 
          onClick={testBackendDirect}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Testar Backend Direto
        </button>
        
        <button 
          onClick={() => setResults([])}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Limpar
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📊 Resultados</h2>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="bg-white p-2 rounded border">
              <pre className="text-sm">{result}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}