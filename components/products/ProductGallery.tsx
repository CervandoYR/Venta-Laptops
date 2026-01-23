'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // Asegurar que siempre haya al menos una imagen (fallback)
  const displayImages = images.length > 0 ? images : ['/placeholder-laptop.jpg']

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <div className="space-y-4">
      
      {/* IMAGEN PRINCIPAL */}
      <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
        
        {/* Usamos <img> estándar para máxima compatibilidad con links externos */}
        <img
          src={displayImages[selectedImage]}
          alt={`${productName} - Vista ${selectedImage + 1}`}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer" // Truco para evitar bloqueos de algunos sitios
          onError={(e) => {
             e.currentTarget.style.display = 'none';
             if(e.currentTarget.parentElement) {
                 e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-50');
                 e.currentTarget.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Imagen no disponible</span>';
             }
          }}
        />

        {/* Botones de Navegación (Solo si hay más de 1 imagen) */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Badge de conteo */}
        {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {displayImages.length}
            </div>
        )}
      </div>

      {/* MINIATURAS (CARRUSEL INFERIOR) */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x no-scrollbar">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`
                relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start
                ${selectedImage === idx ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'}
              `}
            >
              <img
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}