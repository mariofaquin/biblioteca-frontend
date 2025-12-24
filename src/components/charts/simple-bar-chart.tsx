'use client'

interface SimpleBarChartProps {
  data: Array<{
    name: string
    value: number
    [key: string]: any
  }>
  dataKey?: string
  color?: string
  height?: number
}

export function SimpleBarChart({ 
  data, 
  dataKey = 'value', 
  color = '#3b82f6',
  height = 250 
}: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Sem dados para exibir</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item[dataKey] || 0))

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full p-4 bg-gray-50 rounded-lg">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item[dataKey] / maxValue) * (height - 80) : 0
          return (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="text-xs text-gray-600 font-medium">
                {item[dataKey]}
              </div>
              <div
                className="w-8 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              />
              <div className="text-xs text-gray-500 text-center">
                {item.name.length > 6 ? item.name.substring(0, 6) + '...' : item.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}