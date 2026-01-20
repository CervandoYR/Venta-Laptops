'use client'

import { useState } from 'react'
import { Product } from '@prisma/client'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAddToCart() {
    if (product.stock === 0) return

    setLoading(true)
    try {
      await addItem(product, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="btn-secondary w-full opacity-50 cursor-not-allowed"
      >
        Producto Agotado
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || added}
      className={`btn-primary w-full flex items-center justify-center space-x-2 ${
        added ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>
        {loading ? 'Agregando...' : added ? '✓ Agregado al carrito' : 'Agregar al Carrito'}
      </span>
    </button>
  )
}
