/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { buildCSV } from './csv'

describe('buildCSV(rows)', () => {
  it('incluye headers desde keys del primer row', () => {
    const rows = [{ a: 1, b: 2 }]
    const csv = buildCSV(rows)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('a,b')
    expect(lines[1]).toBe('1,2')
  })

  it('escapa comas usando JSON.stringify', () => {
    const rows = [{ a: 'x,y' }]
    const csv = buildCSV(rows)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('a')
    expect(lines[1]).toBe('"x,y"')
  })

  it('escapa comillas internas con JSON.stringify', () => {
    const rows = [{ a: 'q"w' }]
    const csv = buildCSV(rows)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('a')
    expect(lines[1]).toBe('"q\"w"')
  })
})
