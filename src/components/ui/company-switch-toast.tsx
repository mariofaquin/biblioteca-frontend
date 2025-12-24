'use client'

import { useEffect, useState } from 'react'
import { Building2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompanySwitchToastProps {
  fromCompany?: string
  toCompany: string
  onClose: () => void
}

export function CompanySwitchToast({ fromCompany, toCompany, onClose }: CompanySwitchToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Aguardar animação
  }

  useEffect(() => {
    // Auto-close após 5 segundos
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [handleClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto sm:mx-0">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Empresa alterada com sucesso!
            </h3>
            <div className="mt-1 text-sm text-gray-600">
              {fromCompany && (
                <p className="mb-1">
                  <span className="text-gray-500">De:</span> {fromCompany}
                </p>
              )}
              <p className="flex items-center">
                <Building2 className="w-3 h-3 mr-1 text-blue-600" />
                <span className="font-medium text-blue-800">{toCompany}</span>
              </p>
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}