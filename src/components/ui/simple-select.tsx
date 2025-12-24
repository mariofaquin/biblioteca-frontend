import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: (value: string) => void
}

interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (selectRef.current) {
      selectRef.current.setAttribute('data-select-open', isOpen.toString())
    }
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log(isOpen ? '📁 Dropdown fechado' : '📂 Dropdown aberto')
          setIsOpen(!isOpen)
        }}
        {...props}
      >
        {children}
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children }: SelectContentProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className="absolute z-[60] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}

const SelectItem = ({ value, children, onSelect }: SelectItemProps) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleSelect = () => {
    onValueChange?.(value)
    onSelect?.(value)
    setIsOpen(false)
  }

  return (
    <div
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
      onClick={handleSelect}
    >
      {children}
    </div>
  )
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)

  return (
    <span className={value ? "" : "text-muted-foreground"}>
      {value || placeholder}
    </span>
  )
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}