import { motion } from 'framer-motion'
import React from 'react'
import { FileText, BarChart, ChevronDown } from 'lucide-react'

export type SidebarKey = 'carga' | 'informes'

type Props = {
  active: SidebarKey
  onNavigate: (key: SidebarKey) => void
}

export function Sidebar({ active, onNavigate }: Props) {
  const groups = [
    {
      label: 'Comprobantes',
      items: [
        { key: 'carga' as SidebarKey, label: 'Compras', icon: FileText },
      ],
    },
    {
      label: 'Informes',
      items: [
        { key: 'informes' as SidebarKey, label: 'Compras', icon: BarChart },
      ],
    },
  ]

  return (
    <nav className="h-full w-64 min-w-60 max-w-72 rounded-2xl border border-white/30 bg-white/60 backdrop-blur p-3 text-sm" aria-label="Menú principal">
      {groups.map((g) => (
        <div key={g.label} className="mb-3">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 flex items-center gap-1">
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> {g.label}
          </div>
          <ul className="mt-1 space-y-1">
            {g.items.map((it) => {
              const isActive = it.key === active
              const Icon = it.icon
              return (
                <li key={it.key}>
                  <button
                    type="button"
                    onClick={() => onNavigate(it.key)}
                    className={`relative w-full px-2 py-2 rounded-xl flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-400 to-sky-400/90 shadow"
                        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
                      />
                    )}
                    <Icon className="h-4 w-4" />
                    <span>{it.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
