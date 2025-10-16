/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { toNumber } from './numbers'

describe('toNumber es-AR tolerant', () => {
  const cases: Array<[any, number]> = [
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['1234,56', 1234.56],
    ['1234.56', 1234.56],
    ['1.234.567,89', 1234567.89],
    ['1,234,567.89', 1234567.89],
    ['', 0],
    [null, 0],
    [undefined, 0],
    ['abc', 0],
  ]

  for (const [input, out] of cases) {
    it(`parses ${String(input)} -> ${out}`, () => {
      expect(toNumber(input)).toBe(out)
    })
  }
})
