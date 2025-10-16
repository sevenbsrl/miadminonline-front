export function formatCurrencyARS(value: number): string {
  if (typeof value !== 'number' || !isFinite(value)) return 'ARS 0,00'
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
