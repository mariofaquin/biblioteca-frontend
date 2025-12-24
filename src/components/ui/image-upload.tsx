'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  value?: string
  onChange: (value: string | null) => void
  disabled?: boolean
  label?: string
  description?: string
}

// Função para redimensionar imagem mantendo proporção
function resizeImage(img: HTMLImageElement, maxWidth: number, maxHeight: number): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Calcular novas dimensões mantendo proporção
    let { width, height } = img
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }
    
    canvas.width = width
    canvas.height = height
    
    ctx?.drawImage(img, 0, 0, width, height)
    
    const resizedImg = new Image()
    resizedImg.onload = () => resolve(resizedImg)
    resizedImg.src = canvas.toDataURL('image/jpeg', 0.8)
  })
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled = false,
  label = "Imagem",
  description = "Selecione uma imagem"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Prevenir processamento múltiplo
    if (isProcessing || isUploading) {
      console.log('⚠️ Processamento já em andamento, ignorando...')
      return
    }

    setError(null)
    setIsProcessing(true)

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato não suportado. Use JPG, PNG ou WebP')
      return
    }

    // Validar tamanho (máximo 2MB para evitar problemas no backend)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 2MB')
      setIsProcessing(false)
      return
    }

    // Validar dimensões
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)
      
      // Debug: mostrar informações da imagem
      console.log(`📸 Imagem carregada: ${img.width}x${img.height}, Proporção: ${(img.width / img.height).toFixed(2)}, Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      
      // Verificar dimensões mínimas (bem flexível)
      if (img.width < 50 || img.height < 50) {
        setError(`Dimensões muito pequenas: ${img.width}x${img.height}. Mínimo 50x50 pixels`)
        return
      }

      // Aviso sobre proporção (não bloqueia mais)
      const ratio = img.width / img.height
      if (ratio < 0.3 || ratio > 2.0) {
        console.warn(`Proporção não ideal: ${ratio.toFixed(2)}. Recomendado entre 0.3 e 2.0 para melhor visualização`)
      }

      setIsUploading(true)
      
      // Processar imagem com redimensionamento se necessário
      try {
        console.log('🔄 Processando imagem...')
        
        // Redimensionar imagem para tamanho adequado
        // Máximo: 800x1200 pixels para manter qualidade e tamanho razoável
        let finalImage = img
        if (img.width > 800 || img.height > 1200) {
          console.log('📏 Redimensionando imagem grande...')
          finalImage = await resizeImage(img, 800, 1200)
        }
        
        // Converter para base64
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = finalImage.width
        canvas.height = finalImage.height
        
        ctx?.drawImage(finalImage, 0, 0)
        
        // Converter para base64 com qualidade otimizada
        // Qualidade 0.8 = 80% - bom equilíbrio entre qualidade e tamanho
        let base64String = canvas.toDataURL('image/jpeg', 0.8)
        
        // Se o base64 for muito grande (>2MB), reduzir qualidade
        const maxBase64Size = 2 * 1024 * 1024 // 2MB
        let quality = 0.8
        
        while (base64String.length > maxBase64Size && quality > 0.3) {
          quality -= 0.1
          base64String = canvas.toDataURL('image/jpeg', quality)
          console.log(`📉 Reduzindo qualidade para ${(quality * 100).toFixed(0)}% - Tamanho: ${(base64String.length / 1024).toFixed(1)}KB`)
        }
        
        console.log('✅ Imagem processada:', {
          originalSize: `${img.width}x${img.height}`,
          finalSize: `${finalImage.width}x${finalImage.height}`,
          fileSize: `${(file.size / 1024).toFixed(1)}KB`,
          base64Size: `${(base64String.length / 1024).toFixed(1)}KB`,
          quality: `${(quality * 100).toFixed(0)}%`,
          compression: `${((1 - base64String.length / (file.size * 1.37)) * 100).toFixed(1)}%`,
          fileName: file.name
        })
        
        // Verificar se ainda está muito grande
        if (base64String.length > maxBase64Size) {
          setError(`Imagem muito grande mesmo após compressão (${(base64String.length / 1024 / 1024).toFixed(1)}MB). Tente uma imagem menor.`)
          setIsUploading(false)
          setIsProcessing(false)
          return
        }
        
        setPreview(base64String)
        onChange(base64String)
        setIsUploading(false)
        setIsProcessing(false)
        
      } catch (error) {
        console.error('❌ Erro geral no processamento:', error)
        setError('Erro ao processar a imagem')
        setIsUploading(false)
        setIsProcessing(false)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setError('Arquivo de imagem inválido')
      setIsProcessing(false)
    }

    img.src = objectUrl
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
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-4">
        {/* Preview Area */}
        <div 
          className={`
            relative border-2 border-dashed rounded-lg p-4 transition-colors
            ${preview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onClick={handleClick}
        >
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-48 object-cover rounded-md mx-auto border"
                onLoad={() => console.log('✅ Imagem carregada no preview')}
                onError={(e) => {
                  console.error('❌ Erro ao carregar preview:', e)
                  setError('Erro ao exibir preview da imagem')
                }}
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
            <div className="text-center py-8">
              {isUploading ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600">Fazendo upload...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{description}</p>
                    <p className="text-xs text-gray-500">Clique para selecionar</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Specifications */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formatos aceitos:</strong> JPG, PNG, WebP</p>
          <p><strong>Tamanho máximo:</strong> 2MB</p>
          <p><strong>Dimensões mínimas:</strong> 50x50 pixels</p>
          <p><strong>Otimização:</strong> Redimensiona automaticamente se muito grande</p>
          <p><strong>Dica:</strong> Imagens grandes serão otimizadas para melhor performance</p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  )
}