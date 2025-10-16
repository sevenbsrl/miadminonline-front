import { useEffect, useMemo, useState } from 'react'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Button } from '../components/ui/Button'
import { createProvider, fetchProvidersFull, updateProvider, type ProviderFull, type ProviderSavePayload } from '../api/providers'

export default function ProveedoresView() {
  const [list, setList] = useState<ProviderFull[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const [form, setForm] = useState<ProviderSavePayload>({
    companyName: '', cuit: '', address: '', phone: '', fiscalCondition: 'RI', agreement: false, iibbExcept: false, municipalityExcept: false,
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await fetchProvidersFull()
      setList(data)
    } catch (e: any) {
      setError(e.message || 'Error cargando proveedores')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const n = (s: string) => s.toLowerCase()
    const qq = n(q)
    return list.filter(p => n(p.companyName).includes(qq) || n(p.cuit).includes(qq) || n(p.address).includes(qq))
  }, [list, q])

  function handleChange<K extends keyof ProviderSavePayload>(key: K, val: ProviderSavePayload[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      if (editingId) {
        await updateProvider(editingId, form)
      } else {
        await createProvider(form)
      }
      setForm({ companyName: '', cuit: '', address: '', phone: '', fiscalCondition: 'RI', agreement: false, iibbExcept: false, municipalityExcept: false })
      setEditingId(null)
      await load()
    } catch (e: any) { setError(e.message || 'Error guardando proveedor') } finally { setLoading(false) }
  }

  function startEdit(p: ProviderFull) {
    setEditingId(p.id)
    setForm({
      companyName: p.companyName,
      cuit: p.cuit,
      address: p.address,
      phone: p.phone || '',
      fiscalCondition: p.fiscalCondition,
      agreement: p.agreement,
      iibbExcept: p.iibbExcept,
      municipalityExcept: p.municipalityExcept,
    })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Proveedores</h1>
        <div className="text-xs text-gray-500">Crear, editar y buscar</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <section className="md:col-span-1 p-4 rounded-2xl border bg-white/70 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-3" aria-busy={loading}>
            <div>
              <Label>Razón social</Label>
              <Input value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} required />
            </div>
            <div>
              <Label>CUIT</Label>
              <Input value={form.cuit} onChange={(e) => handleChange('cuit', e.target.value)} required />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div>
              <Label>Condición fiscal</Label>
              <select className="w-full rounded-xl border border-white/30 bg-white/70 p-2" value={form.fiscalCondition} onChange={(e) => handleChange('fiscalCondition', e.target.value as any)}>
                <option value="RI">RI</option>
                <option value="MT">MT</option>
                <option value="EX">EX</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.municipalityExcept} onChange={(e) => handleChange('municipalityExcept', e.target.checked)} /> Exento Municipalidad</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.iibbExcept} onChange={(e) => handleChange('iibbExcept', e.target.checked)} /> Exento IIBB</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.agreement} onChange={(e) => handleChange('agreement', e.target.checked)} /> Convenio Multilateral</label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>{editingId ? 'Actualizar' : 'Crear'}</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm({ companyName: '', cuit: '', address: '', phone: '', fiscalCondition: 'RI', agreement: false, iibbExcept: false, municipalityExcept: false }) }}>Cancelar</Button>}
            </div>
            {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
          </form>
        </section>

        <section className="md:col-span-2 p-4 rounded-2xl border bg-white/70 backdrop-blur">
          <div className="mb-3">
            <Input placeholder="Buscar por nombre, CUIT o dirección" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="max-h-[560px] overflow-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {['ID','Razón social','CUIT','Dirección','Teléfono','Cond. fiscal','Multilateral','IIBB Ex.','Munic. Ex.','Acciones'].map(h => (
                    <th key={h} className="px-2 py-2 text-left whitespace-nowrap font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="odd:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap">{p.id}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.companyName}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.cuit}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.address}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.phone || '-'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.fiscalCondition}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.agreement ? 'Sí' : 'No'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.iibbExcept ? 'Sí' : 'No'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.municipalityExcept ? 'Sí' : 'No'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <Button variant="secondary" onClick={() => startEdit(p)}>Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
