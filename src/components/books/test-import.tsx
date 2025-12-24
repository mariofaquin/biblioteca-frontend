'use client'

import { Button } from '@/components/ui/button'
import { ModalFooter } from '@/components/ui/simple-modal'

interface TestImportProps {
  onSuccess: () => void
  onCancel: () => void
}

export function TestImport({ onSuccess, onCancel }: TestImportProps) {
  console.log('🔍 TestImport renderizado!')
  
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-4">🧪 Componente de Teste</h3>
        <p className="text-gray-600 mb-4">
          Se você consegue ver esta mensagem, o modal está funcionando!
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✅ Modal aberto com sucesso<br/>
            ✅ Componente renderizado<br/>
            ✅ Props recebidas corretamente
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={() => {
          console.log('🔍 TestImport onCancel clicado')
          onCancel()
        }}>
          Cancelar
        </Button>
        <Button onClick={() => {
          console.log('🔍 TestImport onSuccess clicado')
          onSuccess()
        }}>
          Fechar
        </Button>
      </ModalFooter>
    </div>
  )
}