'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface UserData {
  name: string
  email: string
  address?: string | null
  phone?: string | null
}

export default function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    address: user.address || '',
    phone: user.phone || '',
    password: '',
    confirmPassword: ''
  })

  // 👇 Expresión Regular: Solo letras (incluye tildes y ñ) y espacios
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // 1. VALIDACIÓN DE NOMBRE
    if (!nameRegex.test(formData.name)) {
      setMessage('⚠️ El nombre solo puede contener letras y espacios.')
      setLoading(false)
      return
    }

    if (formData.name.trim().length < 2) {
      setMessage('⚠️ El nombre es muy corto.')
      setLoading(false)
      return
    }

    // 2. VALIDACIÓN DE CONTRASEÑAS
    if (formData.password !== formData.confirmPassword) {
      setMessage('⚠️ Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password && formData.password.length < 6) {
      setMessage('⚠️ La contraseña es muy corta (mínimo 6 caracteres)')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {})
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar')
      }

      await update({
        ...user,
        name: formData.name,
      })

      setMessage('✅ Perfil actualizado correctamente')
      router.refresh()
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))

    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: DATOS */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Información Personal</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Celular / Teléfono</label>
            <input
              type="tel"
              placeholder="+51 999 999 999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Entrega</label>
            <textarea
              rows={2}
              placeholder="Av. Principal 123, Dpto 401..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* COLUMNA 2: PASSWORD */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Seguridad</h3>
          <p className="text-sm text-gray-500">Solo llena esto si quieres cambiar tu contraseña actual.</p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}