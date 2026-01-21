'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { 
        method: 'DELETE' 
      })
      
      if (!res.ok) throw new Error('Error al eliminar')
      
      router.refresh()
      setShowModal(false)
    } catch (error) {
      alert('Error al eliminar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        title="Eliminar Producto"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Producto?"
        message="¿Estás seguro? Se borrará el producto y sus imágenes. Si está en algún pedido antiguo, podría causar inconsistencias visuales."
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={loading}
      />
    </>
  )
}