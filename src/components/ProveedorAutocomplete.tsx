import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fetchProviders, type Provider } from '../api/providers'
import { Input } from './ui/Input'

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\./g, '').replace(/\s+/g, '')
}

type Props = {
  onSelect: (p: Provider) => void
  onNotFound?: (query: string) => void
  autoFocusHotkey?: string // e.g., 'Alt+F'
}

export default function ProveedorAutocomplete({ onSelect, onNotFound, autoFocusHotkey = 'Alt+F' }: Props) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Provider[]>([])
  const [all, setAll] = useState<Provider[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const debounced = useDebouncedValue(query, 250)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'f') && autoFocusHotkey.toLowerCase() === 'alt+f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [autoFocusHotkey])

  useEffect(() => {
    // carga initial de proveedores una vez
    if (all == null) {
      setLoading(true)
      fetchProviders()
        .then((list) => { setAll(list); setError(null) })
        .catch((e) => setError(e.message === 'AUTH' ? 'Sesión expirada. Volver a iniciar.' : 'Error cargando proveedores'))
        .finally(() => setLoading(false))
    }
  }, [all])

  useEffect(() => {
    if (!debounced) { setItems([]); setActiveIdx(-1); return }
    if (!all) return
    const q = normalize(debounced)
    const filtered = all.filter((p) => normalize(p.companyName).includes(q) || normalize(p.cuit).includes(q))
    setItems(filtered)
    setActiveIdx(filtered.length ? 0 : -1)
  }, [debounced, all])

  const listId = useMemo(() => `prov-list-${Math.random().toString(36).slice(2)}`,[ ])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((idx) => Math.min(idx + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((idx) => Math.max(idx - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && activeIdx >= 0 && activeIdx < items.length) {
        e.preventDefault()
        const p = items[activeIdx]
        onSelect(p)
        setQuery(`${p.companyName} (${p.cuit})`)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  return (
    <div className="relative" role="combobox" aria-expanded={open} aria-owns={listId} aria-controls={listId} aria-busy={loading}>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar proveedor por nombre o CUIT"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={open && activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined}
        />
      </div>
      <div className="sr-only" aria-live="polite">
        {loading ? 'Cargando proveedores…' : `${items.length} resultados`}
      </div>
      {open && (loading || items.length > 0 || error || debounced) && (
        <div className="absolute z-10 mt-1 w-full rounded-2xl border border-white/30 bg-white/90 backdrop-blur shadow" role="listbox" id={listId}>
          {loading && <div className="p-2 text-sm text-gray-600">Cargando...</div>}
          {error && <div className="p-2 text-sm text-red-600" role="alert" aria-live="assertive">{error}</div>}
          {!loading && !error && items.length === 0 && debounced && (
            <button
              type="button"
              className="w-full text-left p-2 text-sm hover:bg-gray-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onNotFound?.(debounced)}
              role="option"
              aria-selected={false}
            >
              No se encontraron resultados. Click para crear rápido.
            </button>
          )}
          <ul className="max-h-60 overflow-auto">
            {items.map((p, idx) => (
              <li key={p.id} role="option" id={`${listId}-opt-${idx}`} aria-selected={idx === activeIdx}>
                <button
                  type="button"
                  className={`w-full text-left p-2 text-sm hover:bg-gray-50 focus:bg-gray-100 focus:outline-none ${idx === activeIdx ? 'bg-gray-50' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(p); setQuery(`${p.companyName} (${p.cuit})`); setOpen(false) }}
                >
                  <div className="font-medium">{p.companyName}</div>
                  <div className="text-xs text-gray-600">{p.cuit}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
