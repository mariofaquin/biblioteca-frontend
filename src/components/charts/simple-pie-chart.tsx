'use client'

interface SimplePieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // orange
  '#ef4444', // red
]

export function SimplePieChart({ data, height = 250 }: SimplePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Sem dados para exibir</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 rounded-lg">
        {/* Simulação visual de pizza com barras horizontais */}
        <div className="w-full space-y-3">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            const color = item.color || COLORS[index % COLORS.length]
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}