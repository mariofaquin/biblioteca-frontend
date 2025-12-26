'use client'

export default function TestSimplePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ Teste Simples - Vercel Funcionando!</h1>
      
      <div style={{ background: '#f0f0f0', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Variáveis de Ambiente:</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || '❌ NÃO DEFINIDA'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      </div>

      <div style={{ background: '#e3f2fd', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Informações do Sistema:</h2>
        <p><strong>URL Atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
        <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'SSR'}</p>
      </div>

      <div style={{ background: '#fff3e0', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Teste de API:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`${apiUrl}/api/health`)
              const data = await response.json()
              alert('✅ Backend respondeu: ' + JSON.stringify(data, null, 2))
            } catch (error: any) {
              alert('❌ Erro: ' + error.message)
            }
          }}
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Testar Backend
        </button>
      </div>

      <div style={{ background: '#f1f8e9', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Status:</h2>
        <p>✅ Next.js está funcionando</p>
        <p>✅ React está funcionando</p>
        <p>✅ Vercel está funcionando</p>
        {apiUrl ? (
          <p>✅ Variável NEXT_PUBLIC_API_URL está definida</p>
        ) : (
          <p>❌ Variável NEXT_PUBLIC_API_URL NÃO está definida</p>
        )}
      </div>
    </div>
  )
}
