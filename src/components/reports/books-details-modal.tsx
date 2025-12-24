'use client'

import { X, BookOpen, TrendingUp, BarChart3, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BooksDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'never-borrowed' | 'high-demand' | 'circulation-rate' | 'most-renewed'
  data: any[]
}

export function BooksDetailsModal({ isOpen, onClose, type, data }: BooksDetailsModalProps) {
  const getTitle = () => {
    switch (type) {
      case 'never-borrowed':
        return '📚 Livros Nunca Emprestados'
      case 'high-demand':
        return '🔥 Livros com Alta Demanda'
      case 'circulation-rate':
        return '📊 Taxa de Circulação'
      case 'most-renewed':
        return '🔄 Livros Mais Renovados'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'never-borrowed':
        return <BookOpen className="h-5 w-5 text-orange-500" />
      case 'high-demand':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'circulation-rate':
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 'most-renewed':
        return <Clock className="h-5 w-5 text-green-500" />
    }
  }

  const renderContent = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      )
    }

    switch (type) {
      case 'never-borrowed':
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.map((book, index) => (
              <div key={book.id} className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-orange-600 mt-1">{book.category}</p>
                  </div>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )

      case 'high-demand':
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.map((book, index) => (
              <div key={book.id} className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                        {book.reservations_count} reservas
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                        {book.active_loans} emprestados
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )

      case 'circulation-rate':
        const circData = data[0]
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total de Livros</p>
                <p className="text-2xl font-bold text-blue-600">{circData.total_books}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Emprestados</p>
                <p className="text-2xl font-bold text-green-600">{circData.borrowed_books}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-600">{circData.available_books}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-gray-600">Taxa de Circulação</p>
                <p className="text-2xl font-bold text-blue-700">{circData.circulation_rate}%</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Análise</p>
              <p className="text-sm text-gray-700">
                {circData.circulation_rate >= 50 
                  ? '✅ Excelente! Mais da metade do acervo está sendo utilizado.'
                  : circData.circulation_rate >= 30
                  ? '⚠️ Bom, mas há espaço para melhorar a circulação.'
                  : '❌ Baixa circulação. Considere campanhas de divulgação.'}
              </p>
            </div>
          </div>
        )

      case 'most-renewed':
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.map((book, index) => (
              <div key={book.id} className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        {book.renewals_count} renovações
                      </span>
                      {book.avg_loan_duration && (
                        <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                          ~{book.avg_loan_duration} dias
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              <DialogTitle>{getTitle()}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {data && data.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              Total: <span className="font-bold">{data.length}</span> {data.length === 1 ? 'registro' : 'registros'}
            </p>
          )}
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
