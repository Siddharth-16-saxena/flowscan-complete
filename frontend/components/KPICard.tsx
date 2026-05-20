'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: number // positive = up, negative = down
  trendLabel?: string
  accent?: 'acid' | 'ember' | 'frost' | 'neutral'
  loading?: boolean
  delay?: number
}

const accentMap = {
  acid: {
    icon: 'text-acid-300',
    bg: 'bg-acid-300/10',
    border: 'border-acid-300/20',
    glow: 'hover:shadow-[0_0_30px_rgba(200,255,62,0.1)]',
  },
  ember: {
    icon: 'text-ember-400',
    bg: 'bg-ember-400/10',
    border: 'border-ember-400/20',
    glow: 'hover:shadow-[0_0_30px_rgba(255,107,53,0.15)]',
  },
  frost: {
    icon: 'text-frost-400',
    bg: 'bg-frost-400/10',
    border: 'border-frost-400/20',
    glow: 'hover:shadow-[0_0_30px_rgba(62,200,255,0.1)]',
  },
  neutral: {
    icon: 'text-ink-300',
    bg: 'bg-white/5',
    border: 'border-white/8',
    glow: 'hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]',
  },
}

export default function KPICard({
  label, value, unit, icon: Icon, trend, trendLabel,
  accent = 'neutral', loading = false, delay = 0,
}: KPICardProps) {
  const styles = accentMap[accent]

  if (loading) {
    return (
      <div className="glass rounded-xl p-5 border border-white/6">
        <div className="skeleton w-8 h-8 rounded-lg mb-4" />
        <div className="skeleton w-16 h-7 rounded mb-2" />
        <div className="skeleton w-24 h-4 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className={clsx(
        'glass rounded-xl p-5 border transition-all duration-300 cursor-default relative overflow-hidden',
        styles.border,
        styles.glow
      )}
    >
      {/* Background accent */}
      <div className={clsx('absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -translate-y-6 translate-x-6', styles.bg)} />

      <div className="relative z-10">
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-4', styles.bg)}>
          <Icon size={18} className={styles.icon} />
        </div>

        <div className="flex items-end gap-1 mb-1">
          <span className="font-display font-800 text-3xl text-white leading-none">{value}</span>
          {unit && <span className="text-ink-400 text-sm mb-0.5">{unit}</span>}
        </div>

        <div className="text-sm text-ink-400">{label}</div>

        {trend !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 mt-3 text-xs font-500',
            trend >= 0 ? 'text-acid-300' : 'text-ember-400'
          )}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% {trendLabel || 'vs last period'}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
