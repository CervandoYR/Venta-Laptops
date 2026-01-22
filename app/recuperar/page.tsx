'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      // Siempre mostramos éxito por seguridad
      setSuccess(true)
    } catch (error) {
      alert('Hubo un error al procesar tu solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        
        <Link href="/login" className="flex items-center text-gray-400 hover:text-blue-600 mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar Cuenta 🔐</h1>
          <p className="text-gray-500 text-sm mt-2">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {success ? (
          <div className="text-center bg-green-50 p-6 rounded-xl border border-green-100">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-green-800 font-bold mb-2">¡Correo Enviado!</h3>
            <p className="text-green-700 text-sm">
              Revisa tu bandeja de entrada. Si el correo existe, recibirás el enlace.
            </p>
            <Link href="/login" className="block mt-4 text-blue-600 font-bold hover:underline text-sm">
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Enviar Enlace de Recuperación'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}