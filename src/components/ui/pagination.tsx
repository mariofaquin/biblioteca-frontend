import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, total)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{total}</span> resultados
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
            let pageNum
            if (lastPage <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= lastPage - 2) {
              pageNum = lastPage - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-10"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
