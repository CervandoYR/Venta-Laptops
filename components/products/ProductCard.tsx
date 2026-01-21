'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@prisma/client'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, AlertCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  // 1. Calcular Descuento
  const hasDiscount = (product as any).originalPrice && (product as any).originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round((((product as any).originalPrice! - product.price) / (product as any).originalPrice!) * 100)
    : 0

  // 2. Lógica de Stock
  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  // 3. Envío Gratis (Ej: Si cuesta más de 500)
  const hasFreeShipping = product.price >= 500

  const displayImage = product.images?.[0] || product.image || '/placeholder-laptop.jpg'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
      
      {/* --- ETIQUETAS FLOTANTES IZQUIERDA --- */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.condition === 'NEW' ? (
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Nuevo
          </span>
        ) : (
          <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            {product.condition === 'LIKE_NEW' ? 'Open Box' : 'Refurbished'}
          </span>
        )}

        {hasFreeShipping && (
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Envío Gratis Lima
          </span>
        )}
      </div>

      {/* --- ETIQUETA DESCUENTO DERECHA --- */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm shadow-md animate-pulse-slow">
          -{discountPercentage}%
        </div>
      )}

      {/* --- IMAGEN --- */}
      <Link href={`/productos/${product.slug}`} className="relative h-56 w-full bg-gray-50 overflow-hidden block">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className={`object-contain p-6 transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">AGOTADO</span>
          </div>
        )}
      </Link>

      {/* --- INFO --- */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold flex justify-between items-center">
          <span>{product.brand}</span>
          {isLowStock && (
            <span className="text-orange-600 flex items-center gap-1 font-bold animate-pulse">
              <AlertCircle className="w-3 h-3" /> ¡Quedan {product.stock}!
            </span>
          )}
        </div>

        <Link href={`/productos/${product.slug}`} className="block mb-3">
          <h3 className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-gray-400 text-sm line-through decoration-red-500 decoration-1">
                {formatPrice((product as any).originalPrice!)}
              </span>
            )}
            <div className="flex justify-between items-end">
              <span className="text-2xl font-extrabold text-gray-900">
                {formatPrice(product.price)}
              </span>
              
              {!isOutOfStock && (
                <button 
                  onClick={() => addItem(product)}
                  className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-red-600 font-bold mt-1">
                ¡Ahorras {formatPrice((product as any).originalPrice! - product.price)}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}