'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function OrderCardActions({ orderId, status }: { orderId: string, status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false) // Estado para el modal

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Error al cancelar')
      router.refresh()
      setShowModal(false) // Cerrar modal al terminar
    } catch (error) {
      alert('No se pudo cancelar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (status !== 'PENDING') return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)} // Solo abre el modal
        className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition-colors mt-2"
      >
        <XCircle className="w-3 h-3" />
        Cancelar Pedido
      </button>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleCancel}
        title="¿Cancelar Pedido?"
        message="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
        confirmText="Sí, Cancelar"
        variant="warning" // Color ámbar para advertencia
        isLoading={loading}
      />
    </>
  )
}