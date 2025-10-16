export function buildCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0] ?? {})
  const headerLine = headers.join(',')
  const lines: string[] = [headerLine]
  for (const row of rows) {
    const cells = headers.map((h) => JSON.stringify(row?.[h] ?? ''))
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

export function downloadBlobCSV(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return
  const csv = buildCSV(rows)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
