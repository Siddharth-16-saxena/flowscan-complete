'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Activity, LayoutDashboard, Upload, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/upload', icon: Upload, label: 'Upload' },
  { href: '/results', icon: BarChart2, label: 'Analysis' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col glass border-r border-white/6 shrink-0 overflow-hidden z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-white/6">
        <div className="w-8 h-8 rounded-lg bg-acid-300 flex items-center justify-center shrink-0">
          <Activity size={16} className="text-ink-900" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display font-700 text-white text-base tracking-tight"
          >
            FlowScan
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-acid-300/15 text-acid-300 border border-acid-300/20'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-500">{item.label}</span>
                )}
                {active && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-acid-300"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/6 space-y-1">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all">
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
