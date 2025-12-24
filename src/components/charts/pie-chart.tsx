'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showLegend?: boolean
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // orange
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange-500
]

export function CustomPieChart({ data, height = 300, showLegend = true }: PieChartProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        {showLegend && (
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}