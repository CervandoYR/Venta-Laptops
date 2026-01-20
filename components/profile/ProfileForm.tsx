'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        await update()
        setMessage('Perfil actualizado exitosamente')
        router.refresh()
      } else {
        setMessage('Error al actualizar el perfil')
      }
    } catch (error) {
      setMessage('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      {message && (
        <div
          className={`p-4 rounded ${
            message.includes('exitosamente')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name || ''}
          className="input"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          defaultValue={user.email || ''}
          className="input bg-gray-100"
          disabled
        />
        <p className="mt-1 text-sm text-gray-500">
          El email no se puede cambiar
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
