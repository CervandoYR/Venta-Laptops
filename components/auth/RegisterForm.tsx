'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, AlertCircle, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validación de contraseña corta
    if(formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        setLoading(false)
        return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al registrarse')
      }

      // Login automático tras registro exitoso
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      router.push('/')
      router.refresh()

    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
        <div className="relative group">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Juan Pérez"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="tu@correo.com"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-1">
          Usa al menos 6 caracteres para mayor seguridad.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Crear Cuenta Gratis'}
      </button>
    </form>
  )
}