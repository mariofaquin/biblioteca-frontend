import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Modal = ({ children, open, onOpenChange }: ModalProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Verificar se há dropdowns abertos
    const openDropdowns = document.querySelectorAll('[data-select-open="true"]')
    if (openDropdowns.length > 0) {
      console.log('🔒 Dropdown aberto - não fechando modal')
      e.preventDefault()
      e.stopPropagation()
      return // Não fechar modal se há dropdowns abertos
    }
    
    // Verificar se o clique foi em um elemento de dropdown
    const target = e.target as HTMLElement
    const isDropdownElement = target.closest('[data-select-open]') || 
                             target.closest('.z-\\[60\\]') ||
                             target.closest('[role="listbox"]') ||
                             target.closest('[role="option"]')
    
    if (isDropdownElement) {
      console.log('🔒 Clique em elemento dropdown - não fechando modal')
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    // Só fecha se o clique foi realmente no backdrop
    if (e.target === e.currentTarget) {
      console.log('✅ Clique no backdrop - fechando modal')
      onOpenChange?.(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      {children}
    </>
  )
}

const ModalTrigger = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...props}>
      {children}
    </button>
  )
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
)
ModalContent.displayName = "ModalContent"

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
ModalHeader.displayName = "ModalHeader"

const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
ModalTitle.displayName = "ModalTitle"

const ModalDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
)
ModalDescription.displayName = "ModalDescription"

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
ModalFooter.displayName = "ModalFooter"

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
}