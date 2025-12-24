'use client'

interface SimpleLineChartProps {
  data: Array<{
    name: string
    [key: string]: any
  }>
  lines: Array<{
    dataKey: string
    color: string
    name: string
  }>
  height?: number
}

export function SimpleLineChart({ 
  data, 
  lines, 
  height = 300
}: SimpleLineChartProps) {
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Sem dados para exibir</p>
      </div>
    )
  }

  // Calcular valores máximos para cada linha
  const maxValues = lines.map(line => 
    Math.max(...data.map(item => item[line.dataKey] || 0))
  )
  const globalMax = Math.max(...maxValues)

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="p-4 bg-gray-50 rounded-lg h-full">
        {/* Legenda */}
        <div className="flex flex-wrap gap-4 mb-4">
          {lines.map((line, index) => (
            <div key={line.dataKey} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-sm text-gray-600">{line.name}</span>
            </div>
          ))}
        </div>

        {/* Gráfico simulado com barras agrupadas */}
        <div className="flex items-end justify-between h-full pb-8">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              {/* Valores */}
              <div className="flex space-x-1 items-end">
                {lines.map((line, lineIndex) => {
                  const value = item[line.dataKey] || 0
                  const barHeight = globalMax > 0 ? (value / globalMax) * (height - 120) : 0
                  return (
                    <div key={line.dataKey} className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {value}
                      </div>
                      <div
                        className="w-3 rounded-t transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: line.color,
                          minHeight: '4px'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              
              {/* Label do mês */}
              <div className="text-xs text-gray-500 text-center">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}