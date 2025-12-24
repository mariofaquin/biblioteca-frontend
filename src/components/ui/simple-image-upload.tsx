'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SimpleImageUploadProps {
  value?: string
  onChange: (value: string | null) => void
  disabled?: boolean
  label?: string
  description?: string
}

export function SimpleImageUpload({ 
  value, 
  onChange, 
  disabled = false,
  label = "Imagem",
  description = "Selecione uma imagem"
}: SimpleImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLoading(true)

    // Validações básicas
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Use apenas JPG, PNG ou WebP')
      setIsLoading(false)
      return
    }

    // Máximo 2MB para evitar problemas
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 2MB')
      setIsLoading(false)
      return
    }

    // Converter para base64
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        console.log('📸 Imagem carregada:', {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)}KB`,
          type: file.type
        })
        setPreview(result)
        onChange(result)
      }
      setIsLoading(false)
    }
    
    reader.onerror = () => {
      setError('Erro ao processar imagem')
      setIsLoading(false)
    }
    
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div 
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer
          ${preview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onClick={handleClick}
      >
        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview da capa"
              className="w-24 h-32 object-cover rounded border mx-auto block"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Carregando...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-700">{description}</p>
                  <p className="text-xs text-gray-500">JPG, PNG ou WebP (máx. 2MB)</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}