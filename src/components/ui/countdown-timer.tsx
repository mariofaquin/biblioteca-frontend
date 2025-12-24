'use client'

import { useState, useEffect } from 'react'

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeLeft(expiresAt: string): TimeLeft {
  const now = new Date().getTime()
  const expiry = new Date(expiresAt).getTime()
  const difference = expiry - now
  
  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 }
  }
  
  return {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    total: difference
  }
}

interface CountdownTimerProps {
  expiresAt: string
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(expiresAt))
  
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiresAt)
      setTimeLeft(newTimeLeft)
      
      // Parar o timer se expirou
      if (newTimeLeft.total <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [expiresAt])
  
  // Determinar cor baseado no tempo restante
  const getColorClass = () => {
    if (timeLeft.hours < 12) {
      return 'text-red-600'
    } else if (timeLeft.hours < 24) {
      return 'text-yellow-600'
    }
    return 'text-green-600'
  }
  
  if (timeLeft.total <= 0) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="text-2xl font-bold text-red-600">
          ⏰ EXPIRADO
        </div>
        <div className="text-sm text-red-600 mt-1">
          Sua reserva foi cancelada
        </div>
      </div>
    )
  }
  
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className={`text-3xl font-bold ${getColorClass()}`}>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-600 mt-2">
        ⏰ Tempo restante para retirada
      </div>
      {timeLeft.hours < 12 && (
        <div className="text-xs text-red-600 mt-2 font-medium">
          ⚠️ Última chance! Retire logo ou perderá a reserva
        </div>
      )}
    </div>
  )
}
