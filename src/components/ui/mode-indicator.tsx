'use client'

export function ModeIndicator() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  if (!isDemoMode) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-1 text-sm font-medium">
      🧪 MODO DEMO ATIVO - Usando dados mockados para testes
    </div>
  )
}