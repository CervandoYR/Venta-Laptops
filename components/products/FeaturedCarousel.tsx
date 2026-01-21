'use client'

import { useRef } from 'react'
import { Product } from '@prisma/client'
import { ProductCard } from './ProductCard'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface FeaturedCarouselProps {
  title: string
  products: Product[]
}

export function FeaturedCarousel({ title, products }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === 'left' ? -320 : 320
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (products.length === 0) return null

  return (
    // 👇 FIX DEL HOVER: Usamos 'group/carousel' en lugar de 'group' genérico
    <section className="py-12 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 relative group/carousel">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-blue-600 fill-current" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Botón Izquierda (Visible siempre, ajustado para móvil) */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full shadow-xl border border-gray-100 text-gray-700 hover:text-blue-600 transition-all opacity-0 group-hover/carousel:opacity-100 flex"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Contenedor Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="min-w-[260px] md:min-w-[280px] snap-center"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Botón Derecha (Visible siempre, ajustado para móvil) */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full shadow-xl border border-gray-100 text-gray-700 hover:text-blue-600 transition-all opacity-0 group-hover/carousel:opacity-100 flex"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

      </div>
    </section>
  )
}