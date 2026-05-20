'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Task {
  task_name: string
  start_time: string
  end_time: string
  assigned_to: string
  duration_minutes: number
  is_bottleneck?: boolean
  has_idle_before?: boolean
  idle_gap_minutes?: number
}

interface TimelineProps {
  tasks: Task[]
  loading?: boolean
}

const assigneeColors = [
  'bg-frost-400',
  'bg-acid-300',
  'bg-ember-400',
  'bg-purple-400',
  'bg-pink-400',
]

function timeToMinutes(t: string): number {
  const [h, m] = (t || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export default function TaskTimeline({ tasks, loading = false }: TimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-4 items-center">
            <div className="skeleton w-24 h-5 rounded" />
            <div className="flex-1 skeleton h-8 rounded-lg" style={{ width: `${30 + i * 15}%` }} />
          </div>
        ))}
      </div>
    )
  }

  if (!tasks.length) return (
    <div className="text-center py-8 text-ink-500 text-sm">No task data available</div>
  )

  const assignees = Array.from(new Set(tasks.map(t => t.assigned_to)))
  const allStarts = tasks.map(t => timeToMinutes(t.start_time))
  const allEnds = tasks.map(t => timeToMinutes(t.end_time))
  const minTime = Math.min(...allStarts)
  const maxTime = Math.max(...allEnds)
  const range = Math.max(maxTime - minTime, 1)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {assignees.map((a, i) => (
          <div key={a} className="flex items-center gap-2 text-xs text-ink-300">
            <div className={clsx('w-3 h-3 rounded-sm', assigneeColors[i % assigneeColors.length])} />
            {a}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-ember-400">
          <div className="w-3 h-3 rounded-sm bg-ember-400 opacity-50" />
          Bottleneck
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <div className="w-3 h-3 rounded-sm border border-dashed border-ink-500" />
          Idle gap
        </div>
      </div>

      {/* Time axis */}
      <div className="flex text-[10px] text-ink-500 font-mono mb-1 pl-28">
        {Array.from({ length: 5 }).map((_, i) => {
          const mins = minTime + (range * i) / 4
          const h = Math.floor(mins / 60).toString().padStart(2, '0')
          const m = (Math.round(mins) % 60).toString().padStart(2, '0')
          return (
            <div key={i} className="flex-1 text-center">{h}:{m}</div>
          )
        })}
      </div>

      {/* Tracks */}
      {tasks.map((task, i) => {
        const startPct = ((timeToMinutes(task.start_time) - minTime) / range) * 100
        const widthPct = ((timeToMinutes(task.end_time) - timeToMinutes(task.start_time)) / range) * 100
        const assigneeIdx = assignees.indexOf(task.assigned_to)
        const color = assigneeColors[assigneeIdx % assigneeColors.length]
        const idleStartPct = task.has_idle_before && task.idle_gap_minutes
          ? ((timeToMinutes(task.start_time) - task.idle_gap_minutes - minTime) / range) * 100
          : null
        const idleWidthPct = task.idle_gap_minutes
          ? (task.idle_gap_minutes / range) * 100
          : 0

        return (
          <motion.div
            key={task.task_name + i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3"
          >
            <div className="w-24 shrink-0 text-right">
              <span className="text-xs text-ink-300 font-500 truncate">{task.task_name}</span>
            </div>
            <div className="flex-1 relative h-9 bg-ink-800/60 rounded-lg overflow-hidden">
              {/* Idle gap */}
              {idleStartPct !== null && idleWidthPct > 0 && (
                <div
                  className="absolute top-1 h-7 rounded border border-dashed border-ink-600/50 bg-ink-700/20"
                  style={{ left: `${idleStartPct}%`, width: `${idleWidthPct}%` }}
                />
              )}
              {/* Task bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                style={{ left: `${startPct}%` }}
                className={clsx(
                  'absolute top-1 h-7 rounded flex items-center px-2 gap-1.5',
                  task.is_bottleneck
                    ? 'bg-ember-400/80 border border-ember-400/50'
                    : clsx(color, 'opacity-80')
                )}
              >
                <span className="text-[10px] text-ink-900 font-700 truncate">{task.assigned_to}</span>
                {task.is_bottleneck && (
                  <span className="text-[9px] bg-ember-600 text-white px-1 rounded font-700">!</span>
                )}
              </motion.div>
            </div>
            <div className="w-16 shrink-0 text-xs text-ink-500 font-mono">
              {task.duration_minutes}m
            </div>
          </motion.div>
        )
      })}

      {/* Time axis bottom */}
      <div className="pl-28 flex text-[10px] text-ink-600 font-mono mt-1">
        <div className="flex-1 border-t border-ink-700 pt-1">
          {minTime ? `${Math.floor(minTime/60)}:${(minTime%60).toString().padStart(2,'0')}` : ''}
        </div>
        <div className="text-right border-t border-ink-700 pt-1">
          {maxTime ? `${Math.floor(maxTime/60)}:${(maxTime%60).toString().padStart(2,'0')}` : ''}
        </div>
      </div>
    </div>
  )
}
