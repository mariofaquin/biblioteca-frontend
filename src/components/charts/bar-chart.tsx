'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    [key: string]: any
  }>
  dataKey?: string
  nameKey?: string
  color?: string
  height?: number
}

export function CustomBarChart({ 
  data, 
  dataKey = 'value', 
  nameKey = 'name', 
  color = '#3b82f6',
  height = 300 
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={nameKey} 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}