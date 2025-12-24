'use client'

import { X, User, Mail, Calendar, BookOpen, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DetailItem {
  id: string
  name: string
  email?: string
  bookTitle?: string
  dueDate?: string
  daysOverdue?: number
  reservedAt?: string
  expiresAt?: string
  status?: string
}

interface DetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  items: DetailItem[]
  type: 'reservations' | 'overdue' | 'noshow' | 'active-users'
}

export function DetailsModal({ isOpen, onClose, title, description, items, type }: DetailsModalProps) {
  const renderItem = (item: DetailItem) => {
    switch (type) {
      case 'reservations':
        return (
          <div key={item.id} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {item.email}
              </p>
              {item.bookTitle && (
                <p className="text-xs text-blue-700 flex items-center mt-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {item.bookTitle}
                </p>
              )}
              {item.reservedAt && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Reservado em: {new Date(item.reservedAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.status || 'Ativa'}
              </span>
            </div>
          </div>
        )

      case 'overdue':
        return (
          <div key={item.id} className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {item.email}
              </p>
              {item.bookTitle && (
                <p className="text-xs text-red-700 flex items-center mt-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {item.bookTitle}
                </p>
              )}
              {item.dueDate && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Vencimento: {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {item.daysOverdue} dias
              </span>
              <p className="text-xs text-red-600 mt-1">em atraso</p>
            </div>
          </div>
        )

      case 'noshow':
        return (
          <div key={item.id} className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {item.email}
              </p>
              {item.bookTitle && (
                <p className="text-xs text-amber-700 flex items-center mt-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {item.bookTitle}
                </p>
              )}
              {item.expiresAt && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Expirou em: {new Date(item.expiresAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Não retirou
              </span>
            </div>
          </div>
        )

      case 'active-users':
        return (
          <div key={item.id} className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {item.email}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Ativo
              </span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Não há dados para exibir neste momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(renderItem)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-600">
            Total: <span className="font-medium">{items.length}</span> {items.length === 1 ? 'registro' : 'registros'}
          </p>
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
