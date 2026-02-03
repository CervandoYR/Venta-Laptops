'use client'

import { Product } from '@prisma/client'
import UniversalImage from '@/components/ui/UniversalImage'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, AlertCircle, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const hasDiscount = (product as any).originalPrice && (product as any).originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round((((product as any).originalPrice! - product.price) / (product as any).originalPrice!) * 100)
    : 0

  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0
  const hasFreeShipping = product.price >= 500

  const displayImage = product.images?.[0] || product.image || '/placeholder-laptop.jpg'

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW': return { text: 'Nuevo', color: 'bg-green-100 text-green-700' }
      case 'LIKE_NEW': return { text: 'Open Box', color: 'bg-teal-100 text-teal-700' }
      case 'USED': return { text: 'Usado', color: 'bg-orange-100 text-orange-700' }
      case 'REFURBISHED': return { text: 'Reacond.', color: 'bg-purple-100 text-purple-700' }
      default: return { text: 'Usado', color: 'bg-gray-100 text-gray-700' }
    }
  }

  const conditionStyle = getConditionLabel(product.condition)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col h-full overflow-hidden">
      
      {/* 1. ZONA DE ATRACCIÓN */}
      <Link href={`/productos/${product.slug}`} className="relative h-60 w-full bg-white overflow-hidden block border-b border-gray-50/50">
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-2 py-1 rounded-md font-extrabold text-xs shadow-md animate-pulse-slow">
            -{discountPercentage}%
          </div>
        )}

        <div className="absolute inset-0 p-6 flex items-center justify-center">
            <UniversalImage
              src={displayImage}
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
        </div>
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 z-20 backdrop-blur-[1px]">
            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-lg font-bold shadow-lg text-sm tracking-wider">AGOTADO</span>
          </div>
        )}
      </Link>

      {/* 2. ZONA DE CONTEXTO E IDENTIDAD */}
      <div className="p-4 flex-1 flex flex-col">
        
        {/* ✅ UX FIX: Etiqueta de Garantía más explícita ("Gtía.") */}
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-gray-400">{product.brand}</span>
          <span className="text-gray-300">•</span>
          <span className={`${conditionStyle.color} px-1.5 py-0.5 rounded-sm`}>
            {conditionStyle.text}
          </span>
          {product.warrantyMonths && product.warrantyMonths > 0 ? (
            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> GTÍA. {product.warrantyMonths} MESES
            </span>
          ) : null}
        </div>

        <Link href={`/productos/${product.slug}`} className="block mb-2 flex-1">
          <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* 3. ZONA DE DECISIÓN */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          
          {isLowStock && !isOutOfStock && (
            <span className="text-[10px] text-red-600 flex items-center gap-1 font-bold animate-pulse mb-1">
              <AlertCircle className="w-3 h-3" /> ¡Últimas {product.stock} unidades!
            </span>
          )}

          <div className="flex justify-between items-end">
            <div>
              {hasDiscount && (
                <span className="text-gray-400 text-xs line-through decoration-red-500 decoration-1 block mb-0.5">
                  {formatPrice((product as any).originalPrice!)}
                </span>
              )}
              <span className="text-xl font-extrabold text-gray-900 leading-none">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {!isOutOfStock && (
              <button 
                onClick={(e) => {
                    e.preventDefault(); 
                    addItem(product);
                }}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95 flex items-center justify-center"
                title="Agregar al carrito"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 min-h-[16px]">
            {hasFreeShipping ? (
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 w-max px-1.5 py-0.5 rounded-sm">
                <Truck className="w-3 h-3" /> Envío Gratis
              </span>
            ) : (hasDiscount && (
              <span className="text-[10px] text-red-600 font-bold">
                ¡Ahorras {formatPrice((product as any).originalPrice! - product.price)}!
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}