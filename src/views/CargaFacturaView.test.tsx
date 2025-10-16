/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CargaFacturaView from './CargaFacturaView'

vi.mock('../components/ProveedorAutocomplete', () => ({
  default: ({ onSelect }: { onSelect: (p: any) => void }) => (
    <button onClick={() => onSelect({ id: '1', nombre: 'Prov SA' })}>select-prov</button>
  )
}))

vi.mock('../api/purchases', () => ({
  createPurchase: async () => ({ ok: true, id: '123' })
}))

describe('CargaFacturaView', () => {
  it('render y calcula IVA/total', async () => {
    render(<CargaFacturaView />)
    // seleccionar proveedor
    fireEvent.click(await screen.findByText('select-prov'))
    // completar campos
    fireEvent.change(screen.getByLabelText('PV'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Nro'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('Base 21%'), { target: { value: '100' } })
    // IVA 21% = 21
    expect(await screen.findByText('21.00')).toBeInTheDocument()
  })
})
