'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  // Regex solo letras
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Validar Nombre
    if (!nameRegex.test(formData.name)) {
      setError('⚠️ El nombre solo puede contener letras y espacios.')
      setLoading(false)
      return
    }

    // 2. Validar Password
    if (formData.password.length < 6) {
      setError('⚠️ La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      // 👇 AQUÍ ESTABA EL ERROR. Ahora apunta a la ruta correcta.
      const res = await fetch('/api/auth/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        // Intentamos leer el JSON, si falla leemos texto plano por si acaso
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(data.error || 'Error al registrarse')
      }

      // Éxito
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
          <p className="text-gray-500 mt-2">Únete a Netsystems hoy</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: María Gonzales"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="nombre@ejemplo.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}