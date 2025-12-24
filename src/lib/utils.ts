import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs))
  } catch (error) {
    // Fallback para caso haja problemas com clsx/twMerge
    return inputs.filter(Boolean).join(' ')
  }
}