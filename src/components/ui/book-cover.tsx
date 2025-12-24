'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'

interface BookCoverProps {
  src?: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export function BookCover({ src, alt, className = "", fallbackClassName = "" }: BookCoverProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Se não há src ou houve erro, mostrar fallback
  if (!src || src.trim() === '' || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName}`}>
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Placeholder enquanto carrega */}
      {!imageLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${fallbackClassName}`}>
          <div className="animate-pulse">
            <BookOpen className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      )}
      
      {/* Imagem real */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onLoad={() => {
          setImageLoaded(true)
          console.log(`✅ Imagem carregada: ${alt}`)
        }}
        onError={(e) => {
          console.warn(`⚠️ Erro ao carregar imagem: ${alt}`, { src: src.substring(0, 50) + '...' })
          setImageError(true)
        }}
      />
    </div>
  )
}