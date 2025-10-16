import React, { useEffect, useMemo, useRef, useState } from 'react'
import ProveedorAutocomplete from '../components/ProveedorAutocomplete'
import { Label } from '../components/ui/Label'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import dayjs from 'dayjs'
import { createPurchase } from '../api/purchases'
import { calcTotal, toNumber } from '../utils/numbers'

export default function CargaFacturaView() {
  const [proveedor, setProveedor] = useState<{ id: string; nombre: string } | null>(null)
  const [pv, setPv] = useState('')
  const [nro, setNro] = useState('')
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'))
  const [fields, setFields] = useState({
    base21: 0, base105: 0, base27: 0, exento: 0, noGravado: 0, percepIVA: 0, percepIIBB: 0, otros: 0, municipality: 0,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const totals = useMemo(() => calcTotal(fields), [fields])

  function handleNumChange(key: keyof typeof fields, v: string) {
    setFields((prev) => ({ ...prev, [key]: toNumber(v) }))
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!proveedor) { setError('Seleccione proveedor'); return }
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await createPurchase({
        proveedorId: proveedor.id,
        pv, nro, fecha,
        ...fields,
      })
      setMessage(res.ok ? 'Guardado con éxito' : 'No se pudo guardar')
      handleClear()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setPv(''); setNro(''); setFecha(dayjs().format('YYYY-MM-DD'))
    setFields({ base21: 0, base105: 0, base27: 0, exento: 0, noGravado: 0, percepIVA: 0, percepIIBB: 0, otros: 0, municipality: 0 })
    formRef.current?.reset()
    setProveedor(null)
  }

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleSubmit() }
      if (e.key === 'Escape') { e.preventDefault(); handleClear() }
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Carga rápida de factura</h1>
        <div className="text-xs text-gray-500">Atajos: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> guardar · <kbd>Esc</kbd> limpiar</div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <div>
          <Label>Proveedor</Label>
          <ProveedorAutocomplete onSelect={(p) => setProveedor({ id: String(p.id), nombre: p.companyName })} />
          {proveedor && <div className="text-sm text-gray-600 mt-1">Seleccionado: {proveedor.nombre}</div>}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="pv">PV</Label>
            <Input id="pv" value={pv} onChange={(e) => setPv(e.target.value)} required aria-describedby="pv-help" />
            <div id="pv-help" className="text-xs text-gray-500 mt-1">Punto de venta</div>
          </div>
          <div>
            <Label htmlFor="nro">Nro</Label>
            <Input id="nro" value={nro} onChange={(e) => setNro(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
        </div>

        <fieldset className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <legend className="sr-only">Bases imponibles y otros</legend>
          {[
            ['base21','Base 21%'],
            ['base105','Base 10.5%'],
            ['base27','Base 27%'],
            ['exento','Exento'],
            ['noGravado','No gravado'],
            ['percepIVA','Percep. IVA'],
            ['percepIIBB','Percep. IIBB'],
            ['municipality','Municipalidad'],
            ['otros','Otros'],
          ].map(([key, label]) => (
            <div key={key as string}>
              <Label htmlFor={key as string}>{label}</Label>
              <Input id={key as string} inputMode="decimal" onChange={(e) => handleNumChange(key as any, e.target.value)} placeholder="0,00" />
            </div>
          ))}
        </fieldset>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded border bg-gray-50"><div className="text-xs text-gray-500">IVA 21%</div><div className="font-medium">{totals.iva21.toFixed(2)}</div></div>
          <div className="p-3 rounded border bg-gray-50"><div className="text-xs text-gray-500">IVA 10.5%</div><div className="font-medium">{totals.iva105.toFixed(2)}</div></div>
          <div className="p-3 rounded border bg-gray-50"><div className="text-xs text-gray-500">IVA 27%</div><div className="font-medium">{totals.iva27.toFixed(2)}</div></div>
          <div className="p-3 rounded border bg-gray-100"><div className="text-xs text-gray-600">Total</div><div className="font-semibold">{totals.total.toFixed(2)}</div></div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} aria-disabled={loading} aria-keyshortcuts="Control+Enter">{loading ? 'Guardando...' : 'Guardar'}</Button>
          <Button type="button" variant="secondary" onClick={handleClear} aria-keyshortcuts="Escape">Limpiar</Button>
        </div>
        <div className="sr-only" aria-live="polite">
          {loading ? 'Guardando…' : message || error || ''}
        </div>
        {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
        {message && <div role="status" aria-live="polite" className="text-sm text-green-700">{message}</div>}
      </form>
    </div>
  )
}
