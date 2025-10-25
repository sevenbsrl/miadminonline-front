export function toNumber(input: string | number | null | undefined): number {
  if (typeof input === 'number') return isFinite(input) ? input : 0
  if (input == null) return 0
  const s = String(input).trim()
  if (s === '') return 0
  // Soportar formato es-AR: miles con punto y decimales con coma
  // 1.234,56 -> 1234.56 ; 1,234.56 -> 1234.56 ; 1234,56 -> 1234.56 ; 1234.56 -> 1234.56
  // Estrategia: detectar el separador decimal por la última ocurrencia de coma o punto.
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  let normalized = s
  if (lastComma > lastDot) {
    // coma es decimal: quitar puntos de miles y reemplazar SOLO la última coma por punto
    const noDots = s.replace(/\./g, '')
    const lastCommaNoDots = noDots.lastIndexOf(',')
    normalized = noDots.replace(/,/g, (_, i: number) => (i === lastCommaNoDots ? '.' : ''))
  } else if (lastDot > lastComma) {
    // punto es decimal: quitar comas de miles
    normalized = s.replace(/,/g, '')
  } else {
    // solo comas o puntos o ninguno; si solo comas, considerar última como decimal
    if (lastComma !== -1) {
      const noDots = s.replace(/\./g, '')
      const lastCommaNoDots = noDots.lastIndexOf(',')
      normalized = noDots.replace(/,/g, (_, i: number) => (i === lastCommaNoDots ? '.' : ''))
    } else {
      normalized = s.replace(/,/g, '')
    }
  }
  const n = Number(normalized)
  return isFinite(n) && !isNaN(n) ? n : 0
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function calcIVA(bases: { base21: number; base105: number; base27: number }) {
  const iva21 = round2(bases.base21 * 0.21)
  const iva105 = round2(bases.base105 * 0.105)
  const iva27 = round2(bases.base27 * 0.27)
  const totalIVA = round2(iva21 + iva105 + iva27)
  return { iva21, iva105, iva27, totalIVA }
}

export function calcTotal(fields: {
  base21: number
  base105: number
  base27: number
  exento: number
  noGravado: number
  percepIVA: number
  percepIIBB: number
  otros: number
  municipality: number
}) {
  const { iva21, iva105, iva27, totalIVA } = calcIVA(fields)
  const subtotal = fields.base21 + fields.base105 + fields.base27 + fields.exento + fields.noGravado
  const total = Math.round(((subtotal + totalIVA + fields.percepIVA + fields.percepIIBB + fields.municipality + fields.otros) + Number.EPSILON) * 100) / 100
  return { iva21, iva105, iva27, totalIVA, subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100, total }
}
