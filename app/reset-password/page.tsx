'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return alert('Las contraseñas no coinciden')
    if (password.length < 6) return alert('Mínimo 6 caracteres')
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setStatus('success')
      setTimeout(() => router.push('/login'), 3000)

    } catch (error) {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return <div className="text-center text-red-500">Token inválido.</div>

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Contraseña Actualizada!</h2>
        <p className="text-gray-500">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mínimo 6 caracteres" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Repite la contraseña" />
        </div>
      </div>
      {status === 'error' && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">El enlace expiró.</div>}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center disabled:opacity-70">
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Cambiar Contraseña'}
      </button>
    </form>
  )
}

export default function ResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Contraseña</h1>
        <Suspense fallback={<div>Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}