'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ImageTest() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageInfo, setImageInfo] = useState<any>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📁 Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    })

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('📸 Imagem convertida:', {
        size: result.length,
        type: result.substring(0, 50),
        isValid: result.startsWith('data:image/')
      })
      
      setSelectedImage(result)
      setImageInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        base64Size: result.length
      })
    }
    
    reader.onerror = (error) => {
      console.error('❌ Erro no FileReader:', error)
    }
    
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">🧪 Teste de Upload de Imagem</h3>
      
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="mb-4"
        />
      </div>

      {imageInfo && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <h4 className="font-medium mb-2">📊 Informações do Arquivo:</h4>
          <p><strong>Nome:</strong> {imageInfo.name}</p>
          <p><strong>Tamanho:</strong> {(imageInfo.size / 1024).toFixed(1)} KB</p>
          <p><strong>Tipo:</strong> {imageInfo.type}</p>
          <p><strong>Base64 Size:</strong> {(imageInfo.base64Size / 1024).toFixed(1)} KB</p>
        </div>
      )}

      {selectedImage && (
        <div className="space-y-4">
          <h4 className="font-medium">🖼️ Preview da Imagem:</h4>
          <div className="border p-4 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Teste"
              className="max-w-xs max-h-48 object-contain border"
              onLoad={() => console.log('✅ Preview carregado com sucesso')}
              onError={(e) => console.error('❌ Erro no preview:', e)}
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded text-sm">
            <h4 className="font-medium mb-2">🔍 Base64 (primeiros 100 chars):</h4>
            <code className="text-xs break-all">
              {selectedImage.substring(0, 100)}...
            </code>
          </div>

          <Button
            onClick={() => {
              console.log('📋 Copiando base64 para clipboard...')
              navigator.clipboard.writeText(selectedImage)
              alert('Base64 copiado para clipboard!')
            }}
          >
            📋 Copiar Base64
          </Button>
        </div>
      )}
    </div>
  )
}