'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // Confirmación simple antes de borrar
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Error al eliminar')
      }

      // Refresca la página para mostrar la lista actualizada
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Hubo un error al intentar eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 text-sm ml-4 transition-colors disabled:opacity-50"
    >
      {isDeleting ? 'Borrando...' : 'Eliminar'}
    </button>
  )
}