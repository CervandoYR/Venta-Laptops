'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center py-12 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Tu carrito está vacío</h1>
          <p className="text-gray-500 mb-8">
            ¡Explora nuestras ofertas y encuentra tu equipo ideal!
          </p>
          {/* 👇 CAMBIO: Redirige al Home */}
          <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full block">
            Ir a la Tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Carrito de Compras</h1>
            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                {items.length} productos
            </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                <Link
                  href={`/productos/${item.product.slug}`}
                  className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border"
                >
                  <Image
                    src={item.product.image || '/placeholder-laptop.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-contain p-2 hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100px, 150px"
                  />
                </Link>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                        <Link
                          href={`/productos/${item.product.slug}`}
                          className="font-bold text-gray-800 hover:text-blue-600 line-clamp-2 pr-4"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.product.brand} • {item.product.condition === 'NEW' ? 'Nuevo' : 'Open Box'}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-white hover:text-blue-600 rounded-l-lg transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-white hover:text-blue-600 rounded-r-lg transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                       <div className="text-xl font-bold text-gray-900">
                         {formatPrice(item.product.price * item.quantity)}
                       </div>
                       {item.quantity > 1 && (
                         <span className="text-xs text-gray-400">
                           {formatPrice(item.product.price)} c/u
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío Estimado</span>
                  <span className={total >= 500 ? "text-green-600 font-bold text-sm" : "text-gray-800 font-medium"}>
                    {total >= 500 ? 'GRATIS' : 'Por calcular'}
                  </span>
                </div>
                {total < 500 && (
                   <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded text-center">
                      ¡Agrega {formatPrice(500 - total)} para envío gratis!
                   </p>
                )}
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between font-extrabold text-2xl text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">*Impuestos incluidos</p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 mb-3"
              >
                Proceder al Pago
              </Link>

              {/* 👇 CAMBIO: Redirige al Home y diseño mejorado */}
              <Link
                href="/"
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Seguir Comprando
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                 <ShieldCheckIcon className="w-4 h-4" />
                 <span className="text-xs">Compra 100% Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldCheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}