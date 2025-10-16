import { motion } from 'framer-motion'

type Tab = { key: string; label: string }

type Props = {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
}

export function NavTabs({ tabs, activeKey, onChange }: Props) {
  return (
    <div className="relative inline-flex items-center rounded-full bg-white/10 p-1 backdrop-blur border border-white/20">
      {tabs.map((t) => {
        const isActive = t.key === activeKey
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative z-10 px-3 py-1.5 text-sm rounded-full transition-colors ${isActive ? 'text-gray-900' : 'text-gray-200 hover:text-white'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 shadow"
                transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
              />
            )}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
