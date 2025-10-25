import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { getPurchases, type Purchase } from '../api/purchases'
import dayjs from 'dayjs'
import { formatCurrencyARS } from '../utils/currency'
import { downloadBlobCSV } from '../utils/csv'
import ProveedorAutocomplete from '../components/ProveedorAutocomplete'

export default function InformesView() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [to, setTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'))
  const [proveedorId, setProveedorId] = useState('')
  const [proveedorNombre, setProveedorNombre] = useState('')
  const [provKey, setProvKey] = useState(0) // para resetear el Autocomplete cuando se limpia
  const [data, setData] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchData(opts?: { proveedorId?: string }) {
    setLoading(true)
    setError(null)
    try {
      const pid = opts && 'proveedorId' in opts ? opts.proveedorId : (proveedorId || undefined)
      const res = await getPurchases({ from, to, proveedorId: pid })
      setData(res)
    } catch (e: any) {
      setError(e.message || 'Error al cargar informes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const kpis = useMemo(() => {
    let base = 0, iva21 = 0, iva105 = 0, iva27 = 0, iibb = 0, muni = 0
    for (const r of data) {
      base += (r.engraved ?? (r.base21 + r.base105 + r.base27))
      iva21 += r.base21 * 0.21
      iva105 += r.base105 * 0.105
      iva27 += r.base27 * 0.27
      iibb += r.percepIIBB
      muni += r.municipality || 0
    }
    return { base, iva: iva21 + iva105 + iva27, iibb, muni }
  }, [data])

  function exportCSV() {
    const rows = data.map((r) => {
      const iva21 = r.base21 * 0.21
      const iva105 = r.base105 * 0.105
      const iva27 = r.base27 * 0.27
      const base = (r.engraved ?? (r.base21 + r.base105 + r.base27)) + r.exento + r.noGravado
      const total = base + iva21 + iva105 + iva27 + r.percepIVA + r.percepIIBB + (r.municipality || 0) + r.otros
      return {
        fecha: r.fecha,
        codigo: r.invoiceTypeCode || '',
        proveedor: r.proveedorNombre,
        cuit: r.proveedorCUIT || '',
        'pv/nro': `${r.pv}/${r.nro}`,
        base: r.engraved ?? (r.base21 + r.base105 + r.base27),
        exento: r.exento,
        'no grav': r.noGravado,
        iva21,
        iva105,
        iva27,
        'percep iva': r.percepIVA,
        'percep iibb': r.percepIIBB,
        muni: r.municipality || 0,
        otros: r.otros,
        total,
      } as any
    })
    downloadBlobCSV(`informes-${from}-al-${to}.csv`, rows)
  }

  return (
    <div className="p-4 max-w-full" aria-busy={loading}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Informes</h1>
        <div className="text-xs text-gray-500">Rango y proveedor opcional. Exporta CSV con BOM.</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 items-end">
        <div>
          <Label htmlFor="from">Desde</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Proveedor</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <ProveedorAutocomplete
                key={provKey}
                autoFocusHotkey="" // deshabilita Alt+F en informes
                onSelect={(p) => { setProveedorId(String(p.id)); setProveedorNombre(p.companyName) }}
              />
            </div>
            {proveedorId && (
              <Button
                variant="secondary"
                className="shrink-0"
                type="button"
                onClick={() => {
                  setProveedorId('')
                  setProveedorNombre('')
                  setProvKey((k) => k + 1)
                  fetchData({ proveedorId: undefined })
                }}
                aria-label="Quitar filtro de proveedor"
              >
                Quitar
              </Button>
            )}
          </div>
          {proveedorId && <div className="text-xs text-gray-500 mt-1">Seleccionado: {proveedorNombre} (ID {proveedorId})</div>}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchData()} disabled={loading} aria-busy={loading} aria-disabled={loading}>{loading ? 'Cargando...' : 'Buscar'}</Button>
          <Button variant="secondary" onClick={exportCSV}>Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded border bg-gray-50">
          <div className="text-xs text-gray-600">Base</div>
          <div className="text-lg font-semibold">{formatCurrencyARS(kpis.base)}</div>
        </div>
        <div className="p-3 rounded border bg-gray-50">
          <div className="text-xs text-gray-600">IVA</div>
          <div className="text-lg font-semibold">{formatCurrencyARS(kpis.iva)}</div>
        </div>
        <div className="p-3 rounded border bg-gray-50">
          <div className="text-xs text-gray-600">IIBB</div>
          <div className="text-lg font-semibold">{formatCurrencyARS(kpis.iibb)}</div>
        </div>
        <div className="p-3 rounded border bg-gray-50">
          <div className="text-xs text-gray-600">Muni</div>
          <div className="text-lg font-semibold">{formatCurrencyARS(kpis.muni)}</div>
        </div>
      </div>

      {error && <div role="alert" aria-live="assertive" className="text-sm text-red-600 mb-2">{error}</div>}

      {/* Tabla con altura fija y scroll, ~15 filas visibles */}
      <div className="rounded border bg-white">
        <div className="max-h-[560px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {['Fecha','Código','Proveedor','CUIT','PV/Nro','Base','Exento','No Grav','IVA 21','IVA 10.5','IVA 27','Percep IVA','Percep IIBB','Muni','Otros','Total'].map(h => (
                  <th key={h} className="px-2 py-2 text-left whitespace-nowrap font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const iva21 = r.base21 * 0.21
                const iva105 = r.base105 * 0.105
                const iva27 = r.base27 * 0.27
                const base = (r.engraved ?? (r.base21 + r.base105 + r.base27)) + r.exento + r.noGravado
                const totalRow = base + iva21 + iva105 + iva27 + r.percepIVA + r.percepIIBB + (r.municipality || 0) + r.otros
                return (
                  <tr key={r.id} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-2 py-2 whitespace-nowrap">{r.fecha}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{r.invoiceTypeCode || ''}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{r.proveedorNombre}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{r.proveedorCUIT || ''}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{r.pv}/{r.nro}</td>
                    <td className="px-2 py-2 text-right">{(r.engraved ?? (r.base21 + r.base105 + r.base27)).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{r.exento.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{r.noGravado.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{iva21.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{iva105.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{iva27.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{r.percepIVA.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{r.percepIIBB.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{(r.municipality || 0).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">{r.otros.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right font-medium">{totalRow.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
