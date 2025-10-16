import { useEffect, useState } from 'react'
import LoginView from './views/LoginView'
import CargaFacturaView from './views/CargaFacturaView'
import InformesView from './views/InformesView'
import { motion } from 'framer-motion'
import { Sidebar, type SidebarKey } from './components/Sidebar'
import './App.css'
import ProveedoresView from './views/ProveedoresView'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [view, setView] = useState<SidebarKey>('carga')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { setToken(localStorage.getItem('token')) }, [])

  if (!token) return <LoginView onLogin={() => setToken(localStorage.getItem('token'))} />

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(99,102,241,0.25),transparent)]">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/40 border-b border-white/30">
        <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl px-3 py-2 border border-white/30 bg-white/70"
              aria-label="Alternar menú"
              aria-pressed={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              ☰
            </button>
            <div className="rounded-2xl px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-500 shadow">M</div>
            <h1 className="font-semibold">miadminonline</h1>
          </div>
        </div>
      </header>
      {/* Two-column layout with collapsible left sidebar */}
      <div className="w-full px-4 md:px-6 py-4 flex gap-4">
        <aside className={`${sidebarOpen ? 'block w-64 shrink-0' : 'hidden'} md:${sidebarOpen ? 'block w-64 shrink-0' : 'hidden'}`}>
          {sidebarOpen && <Sidebar active={view} onNavigate={(k) => { setView(k) }} />}
        </aside>
        <main className="flex-1 min-w-0">
          <section>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-white/30 bg-white/70 backdrop-blur shadow-sm">
              {view === 'carga' ? <CargaFacturaView /> : view === 'informes' ? <InformesView /> : <ProveedoresView />}
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
