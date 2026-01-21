'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Save, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock 
} from 'lucide-react'

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
  
  // Estado mejorado para feedback visual
  const [feedback, setFeedback] = useState<{ 
    type: 'success' | 'error' | 'warning', 
    message: string 
  } | null>(null)
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    address: user.address || '',
    phone: user.phone || '',
    password: '',
    confirmPassword: ''
  })

  // Regex: Solo letras y espacios
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    // --- 1. VALIDACIONES LOCALES (WARNINGS) ---
    
    if (!nameRegex.test(formData.name)) {
      setFeedback({ type: 'warning', message: 'El nombre solo puede contener letras y espacios.' })
      setLoading(false)
      return
    }

    if (formData.name.trim().length < 2) {
      setFeedback({ type: 'warning', message: 'El nombre es muy corto.' })
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFeedback({ type: 'warning', message: 'Las contraseñas no coinciden.' })
      setLoading(false)
      return
    }

    if (formData.password && formData.password.length < 6) {
      setFeedback({ type: 'warning', message: 'La contraseña debe tener al menos 6 caracteres.' })
      setLoading(false)
      return
    }

    // --- 2. PETICIÓN AL SERVIDOR ---

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
        throw new Error(data.error || 'Ocurrió un error al actualizar.')
      }

      await update({
        ...user,
        name: formData.name,
      })

      setFeedback({ type: 'success', message: '¡Tu perfil se ha actualizado correctamente!' })
      router.refresh()
      
      // Limpiar campos de password por seguridad
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))

    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para estilos dinámicos
  const getFeedbackStyles = () => {
    switch (feedback?.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      default:
        return ''
    }
  }

  // Función auxiliar para iconos dinámicos
  const FeedbackIcon = () => {
    switch (feedback?.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
      case 'error': return <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
      default: return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all">
      
      {/* --- SECCIÓN DE MENSAJES DE ESTADO --- */}
      {feedback && (
        <div className={`flex items-start gap-3 p-4 mb-8 rounded-xl border animate-fade-in-down ${getFeedbackStyles()}`}>
          <FeedbackIcon />
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
              {feedback.type === 'success' ? 'Éxito' : feedback.type === 'error' ? 'Error' : 'Atención'}
            </h4>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              {feedback.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
        
        {/* COLUMNA 1: DATOS PERSONALES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Información Personal</h3>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 p-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
            <p className="text-xs text-gray-400 ml-1">El correo no se puede cambiar.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Celular / Teléfono</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="tel"
                placeholder="+51 999 999 999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Dirección de Entrega</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <textarea
                rows={2}
                placeholder="Av. Principal 123, Lima..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* COLUMNA 2: SEGURIDAD */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Seguridad</h3>
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800 mb-4 font-medium">
              Solo llena estos campos si deseas cambiar tu contraseña actual.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  )
}