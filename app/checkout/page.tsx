'use client'

import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ShieldCheck, UserCheck, Truck, MessageCircle, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, itemCount } = useCart()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  // Calculamos el total manualmente por si el contexto no lo trae actualizado
  const cartTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // --- CONFIGURACIÓN ENVÍO ---
  const FREE_SHIPPING_THRESHOLD = 500
  const SHIPPING_COST = 15

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío 🛒</h2>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition">
          Volver a la Tienda
        </Link>
      </div>
    )
  }

  // --- CÁLCULOS DE TOTALES ---
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD
  const shippingPrice = isFreeShipping ? 0 : SHIPPING_COST
  const finalTotal = cartTotal + shippingPrice

  // --- GENERAR LINK WHATSAPP ---
  const generateWhatsAppLink = () => {
    const phone = '51926870309' // NÚMERO DE VENTAS AQUÍ
    
    const productList = items.map(item => `▪️ ${item.product.name} (x${item.quantity})`).join('\n')
    const customerName = session?.user?.name || 'Cliente'

    const shippingText = isFreeShipping ? 'GRATIS (Lima)' : `S/. ${SHIPPING_COST.toFixed(2)} (Lima)`
    const totalFormatted = formatPrice(finalTotal).replace('S/', 'S/.')

    const message = `👋 Hola Servitek, soy *${customerName}*!

Quiero finalizar mi compra de:
${productList}

📦 Subtotal: ${formatPrice(cartTotal).replace('S/', 'S/.')}
🚚 Envío: ${shippingText}
💰 *Total Final: ${totalFormatted}*

Quedo atento para coordinar el pago. Gracias!`

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            ¡Excelente elección! 🚀
          </h1>
          <p className="text-gray-600 text-lg">
            Finaliza tu compra de forma segura vía WhatsApp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: RESUMEN DE COMPRA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 order-2 md:order-1">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Resumen de tu Pedido</h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border">
                    <Image 
                      src={item.product.image} 
                      alt={item.product.name} 
                      fill 
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-700 text-sm">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Costo de Envío (Lima)</span>
                {isFreeShipping ? (
                  <span className="text-green-600 font-bold">GRATIS 🎉</span>
                ) : (
                  <span className="text-gray-800 font-medium">S/. {SHIPPING_COST.toFixed(2)}</span>
                )}
              </div>

              {!isFreeShipping && (
                <div className="bg-orange-50 text-orange-800 text-xs p-2 rounded mt-2 border border-orange-100 text-center">
                  ¡Agrega <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)}</strong> más para envío gratis!
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Envío a Provincia</span>
                <span className="italic">Pago en destino</span>
              </div>

              <div className="flex justify-between text-2xl font-extrabold text-blue-900 mt-4 pt-4 border-t border-dashed">
                <span>Total a Pagar</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONFIRMACIÓN Y BENEFICIOS */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-xl p-6 md:p-8 text-white order-1 md:order-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

            <h2 className="text-2xl font-bold mb-4 relative z-10">Confirmar con un Asesor</h2>
            <p className="text-blue-100 mb-8 relative z-10 leading-relaxed">
              Un experto de Servitek validará el stock en tiempo real y coordinará la entrega contigo.
            </p>

            <div className="space-y-4 mb-8 relative z-10">
              
              {/* BENEFICIO 1: PAGO SEGURO */}
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <div>
                  <h4 className="font-bold text-sm">Pago Seguro</h4>
                  <p className="text-xs text-blue-200">Aceptamos Transferencia, Yape/Plin o Efectivo.</p>
                </div>
              </div>

              {/* BENEFICIO 2: ASESORÍA HUMANA (RESTAURADO) */}
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <UserCheck className="w-6 h-6 text-yellow-400" />
                <div>
                  <h4 className="font-bold text-sm">Asesoría Humana</h4>
                  <p className="text-xs text-blue-200">Resuelve dudas técnicas antes de pagar.</p>
                </div>
              </div>

              {/* BENEFICIO 3: ENTREGA RÁPIDA */}
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <Truck className="w-6 h-6 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-sm">Entrega Rápida</h4>
                  <p className="text-xs text-blue-200">
                    {isFreeShipping ? '¡Calificas para Envío Gratis en Lima!' : 'Envíos a todo el Perú en 24/48h.'}
                  </p>
                </div>
              </div>
            </div>

            <a 
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-3 relative z-10 animate-pulse-slow"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>Contactar Asesor Ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-center text-xs text-blue-300 mt-4 opacity-80">
              * Serás redirigido a WhatsApp con el detalle listo para enviar.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}