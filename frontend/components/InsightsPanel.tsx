'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, Lightbulb, TrendingDown, Clock } from 'lucide-react'
import clsx from 'clsx'

interface Insight {
  type: 'bottleneck' | 'idle' | 'suggestion' | 'warning'
  message: string
}

interface InsightsPanelProps {
  bottlenecks: string[]
  suggestions: string[]
  idle_info?: string[]
  loading?: boolean
}

const iconMap = {
  bottleneck: { icon: AlertTriangle, color: 'text-ember-400', bg: 'bg-ember-400/10', border: 'border-ember-400/20' },
  idle: { icon: Clock, color: 'text-frost-400', bg: 'bg-frost-400/10', border: 'border-frost-400/20' },
  suggestion: { icon: Lightbulb, color: 'text-acid-300', bg: 'bg-acid-300/10', border: 'border-acid-300/20' },
  warning: { icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
}

function InsightCard({ type, message, delay }: { type: keyof typeof iconMap; message: string; delay: number }) {
  const { icon: Icon, color, bg, border } = iconMap[type]
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: 3 }}
      className={clsx('flex gap-3 p-3.5 rounded-xl border transition-all duration-200', bg, border)}
    >
      <div className={clsx('shrink-0 mt-0.5', color)}>
        <Icon size={15} />
      </div>
      <p className="text-sm text-ink-200 leading-relaxed">{message}</p>
    </motion.div>
  )
}

export default function InsightsPanel({ bottlenecks, suggestions, idle_info = [], loading = false }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="skeleton rounded-xl h-14" />)}
      </div>
    )
  }

  const allEmpty = !bottlenecks.length && !suggestions.length && !idle_info.length

  if (allEmpty) {
    return (
      <div className="text-center py-8 text-ink-500 text-sm">
        Upload workflow data to see AI insights
      </div>
    )
  }

  let delayCounter = 0

  return (
    <div className="space-y-2.5">
      {bottlenecks.map((msg, i) => (
        <InsightCard key={'b' + i} type="bottleneck" message={msg} delay={(delayCounter++) * 0.07} />
      ))}
      {idle_info.map((msg, i) => (
        <InsightCard key={'id' + i} type="idle" message={msg} delay={(delayCounter++) * 0.07} />
      ))}
      {suggestions.map((msg, i) => (
        <InsightCard key={'s' + i} type="suggestion" message={msg} delay={(delayCounter++) * 0.07} />
      ))}
    </div>
  )
}
