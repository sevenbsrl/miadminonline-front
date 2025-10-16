import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { login } from '../api/auth'

export default function LoginView({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      onLogin()
    } catch (err: any) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 bg-white border rounded-lg shadow p-6" aria-label="Formulario de login">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Iniciar sesión</h1>
          <p className="text-sm text-gray-500">Accedé con tu usuario y contraseña.</p>
        </div>
        <div>
          <Label htmlFor="username">Usuario</Label>
          <Input id="username" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
        <Button type="submit" disabled={loading} aria-busy={loading} aria-live="polite" className="w-full h-10">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  )
}
