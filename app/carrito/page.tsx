'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, loading } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (!mounted || loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Cargando carrito...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">
            Agrega productos para comenzar a comprar
          </p>
          <Link href="/productos" className="btn-primary">
            Ver Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4">
              <div className="flex gap-4">
                <Link
                  href={`/productos/${item.product.slug}`}
                  className="relative w-24 h-24 bg-gray-100 rounded flex-shrink-0"
                >
                  <Image
                    src={item.product.image || '/placeholder-laptop.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                    
                  />
                </Link>

                <div className="flex-grow">
                  <Link
                    href={`/productos/${item.product.slug}`}
                    className="font-semibold text-lg hover:text-primary-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.product.brand} - {item.product.model}
                  </p>
                  <div className="text-primary-600 font-bold">
                    {formatPrice(item.product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800 p-2"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                      disabled={item.quantity >= item.product.stock}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="font-bold text-lg">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600">
                  {total >= 500 ? 'Gratis' : formatPrice(100)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>{formatPrice(total >= 500 ? total : total + 100)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full block text-center"
            >
              Proceder al Pago
            </Link>

            <Link
              href="/productos"
              className="btn-outline w-full block text-center mt-2"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
