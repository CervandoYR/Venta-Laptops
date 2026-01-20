'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Si no hay imágenes, usamos el placeholder
  const validImages = images.length > 0 ? images : ['/placeholder.png']
  
  // Usamos el ÍNDICE (0, 1, 2...) para saber cuál mostramos y poder sumar/restar
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Funciones para las flechas
  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* IMAGEN GRANDE PRINCIPAL */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white border flex items-center justify-center group">
        
        {/* Foto */}
        <Image
          src={validImages[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          fill
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* FLECHAS DE NAVEGACIÓN (Solo si hay más de 1 foto) */}
        {validImages.length > 1 && (
          <>
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                ❮
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                ❯
            </button>
          </>
        )}
        
        {/* Etiqueta de Zoom (Opcional) */}
        <div className="absolute top-2 right-2 bg-black/5 text-xs text-gray-500 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
           {selectedIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* MINIATURAS (CARRUSEL DE ABAJO) */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`
                relative aspect-square border rounded-md overflow-hidden bg-white 
                transition-all cursor-pointer
                ${selectedIndex === idx 
                    ? 'ring-2 ring-blue-600 ring-offset-1 opacity-100' 
                    : 'opacity-60 hover:opacity-100 hover:ring-2 hover:ring-gray-300'}
              `}
            >
              <Image
                src={img}
                alt={`Vista ${idx + 1}`}
                fill
                className="object-contain p-1"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}