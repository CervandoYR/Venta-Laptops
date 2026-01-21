'use client'

import { useState } from 'react'
import { Product } from '@prisma/client'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext' // Asegúrate de que este archivo exista (paso 3)
import { ShoppingCart, Check, Loader2, XCircle } from 'lucide-react'

interface AddToCartButtonProps {
  product: Product
}

// 👇 CAMBIO IMPORTANTE: Quitamos 'default' para evitar el error de importación
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { showToast, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() 
    
    if (product.stock === 0) return

    setLoading(true)
    
    // Añadimos al carrito
    const success = await addItem(product, 1)
    
    setLoading(false)

    if (success) {
      setStatus('success')
      // Lanzamos la alerta bonita
      showToast({
        product: {
          name: product.name,
          image: product.image || '',
          price: product.price
        }
      })
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
      showError(`¡Stock insuficiente! Solo quedan ${product.stock} unidades.`)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (product.stock === 0) {
    return (
      <button disabled className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2">
        <XCircle className="w-5 h-5" /> Agotado
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || status === 'success'}
      className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all transform active:scale-95 shadow-md ${
        status === 'success'
          ? 'bg-green-600 text-white shadow-green-500/30'
          : status === 'error'
          ? 'bg-red-600 text-white shadow-red-500/30'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 hover:shadow-lg'
      } disabled:opacity-90 disabled:cursor-not-allowed disabled:transform-none`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : status === 'success' ? (
        <>
          <Check className="w-5 h-5" /> ¡Agregado!
        </>
      ) : status === 'error' ? (
        <>
          <XCircle className="w-5 h-5" /> Sin Stock
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
        </>
      )}
    </button>
  )
}