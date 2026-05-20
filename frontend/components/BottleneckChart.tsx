'use client'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts'

interface BottleneckData {
  task_name: string
  duration_minutes: number
  is_bottleneck: boolean
  delay_percentage?: number
}

interface BottleneckChartProps {
  data: BottleneckData[]
  avgDuration?: number
  loading?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="font-display font-700 text-white mb-1">{d.task_name}</p>
      <p className="text-ink-300">Duration: <span className="text-acid-300">{d.duration_minutes}m</span></p>
      {d.is_bottleneck && (
        <p className="text-ember-400 text-xs mt-1">⚠ Bottleneck detected</p>
      )}
      {d.delay_percentage && (
        <p className="text-ember-400 text-xs">{d.delay_percentage.toFixed(0)}% above average</p>
      )}
    </div>
  )
}

export default function BottleneckChart({ data, avgDuration, loading = false }: BottleneckChartProps) {
  if (loading) {
    return <div className="skeleton rounded-xl h-64 w-full" />
  }

  if (!data.length) return (
    <div className="text-center py-8 text-ink-500 text-sm">No data</div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="task_name"
            tick={{ fill: '#66667e', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#66667e', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {avgDuration && (
            <ReferenceLine
              y={avgDuration}
              stroke="#c8ff3e"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'avg', fill: '#c8ff3e', fontSize: 10, dx: 8 }}
            />
          )}
          <Bar dataKey="duration_minutes" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.is_bottleneck ? '#ff6b35' : '#3ec8ff'}
                fillOpacity={entry.is_bottleneck ? 0.9 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
