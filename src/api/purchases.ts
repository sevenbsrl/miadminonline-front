import { getAuthHeaders, logout } from './auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type PurchaseItemTotals = {
  base21: number
  base105: number
  base27: number
  exento: number
  noGravado: number
  percepIVA: number
  percepIIBB: number
  otros: number
}

export type PurchasePayload = {
  proveedorId: string
  pv: string
  nro: string
  fecha: string // ISO
} & PurchaseItemTotals

export type Purchase = PurchasePayload & {
  id: string
  proveedorNombre: string
  proveedorCUIT?: string
  engraved?: number
}

export async function createPurchase(payload: PurchasePayload): Promise<{ ok: boolean; id: string }> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }
  const res = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (res.status === 401) {
    logout()
    throw new Error('AUTH')
  }
  if (!res.ok) throw new Error(await res.text() || 'Error creando compra')
  return res.json()
}

export async function getPurchases(params: { from?: string; to?: string; proveedorId?: string }): Promise<Purchase[]> {
  const usp = new URLSearchParams()
  if (params.from) usp.set('startDate', params.from)
  if (params.to) usp.set('endDate', params.to)
  // impacted fijo en false según requerimiento
  usp.set('impacted', 'false')
  if (params.proveedorId) usp.set('idProvider', params.proveedorId)

  // Base del servicio de retenciones local (ajustar si difiere)
  const RET_BASE = (import.meta.env.VITE_RETENCIONES_BASE as string) || 'http://localhost:8080/v1/retenciones'
  const url = `${RET_BASE}/invoice?${usp.toString()}`

  const headers = getAuthHeaders()
  const res = await fetch(url, { headers })
  if (res.status === 401) {
    logout()
    throw new Error('AUTH')
  }
  if (!res.ok) throw new Error(await res.text() || 'Error obteniendo compras')
  const json = await res.json()

  type InvoiceResp = {
    id: number
    pointSale: number
    number: number
    provider: { id: number; companyName: string; cuit: string }
    date: string
    engraved: number
    exempt: number
    iva105: number
    iva21: number
    iva27?: number
    iibb: number
    taxedOthers: number
    municipality: number
  }

  const toBase = (iva: number, rate: number) => (iva > 0 ? +(iva / rate).toFixed(2) : 0)

  const mapped: Purchase[] = (Array.isArray(json) ? json : []).map((inv: InvoiceResp) => {
    const base21 = toBase(inv.iva21 || 0, 0.21)
    const base105 = toBase(inv.iva105 || 0, 0.105)
    const base27 = toBase(inv.iva27 || 0, 0.27)
    const otros = (inv.taxedOthers || 0) + (inv.municipality || 0)
    const r: Purchase = {
      id: String(inv.id),
      proveedorId: String(inv.provider?.id ?? ''),
      proveedorNombre: String(inv.provider?.companyName ?? ''),
      proveedorCUIT: String(inv.provider?.cuit ?? ''),
      pv: String(inv.pointSale ?? ''),
      nro: String(inv.number ?? ''),
      fecha: inv.date,
      engraved: inv.engraved ?? (base21 + base105 + base27),
      base21,
      base105,
      base27,
      exento: inv.exempt || 0,
      noGravado: 0,
      percepIVA: 0,
      percepIIBB: inv.iibb || 0,
      otros,
    }
    return r
  })

  return mapped
}
