'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Imágenes por defecto (solo se usan si la lista está vacía)
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
  "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80", 
  "https://images.unsplash.com/photo-1588872657578-a3d2e1a32e2d?w=800&q=80"
]

interface ImageCarouselProps {
  images?: string[]
}

export default function ImageCarousel({ images = [] }: ImageCarouselProps) {
  // Si no pasamos imágenes, usa las de defecto
  const displayImages = images.length > 0 ? images : DEFAULT_IMAGES
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [displayImages.length])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {displayImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Sombra sutil para mejorar contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
      ))}

      {/* Puntitos de navegación */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 w-2 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}