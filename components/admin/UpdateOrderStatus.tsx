'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'

interface UpdateOrderStatusProps {
  orderId: string
  currentStatus: OrderStatus
}

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: UpdateOrderStatusProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function handleUpdateStatus(newStatus: OrderStatus) {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setStatus(newStatus)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions: OrderStatus[] = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]

  return (
    <div>
      <select
        value={status}
        onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
        disabled={loading}
        className="input w-full"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option === 'PENDING' && 'Pendiente'}
            {option === 'PROCESSING' && 'Procesando'}
            {option === 'SHIPPED' && 'En Camino'}
            {option === 'DELIVERED' && 'Entregado'}
            {option === 'CANCELLED' && 'Cancelado'}
          </option>
        ))}
      </select>
    </div>
  )
}
