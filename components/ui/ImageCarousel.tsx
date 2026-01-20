'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
    alt: 'Espacio de trabajo minimalista',
  },
  {
    url: 'https://p3-ofp.static.pub/ShareResource/we/brands/laptops-thinkpad/images/slide3.jpg',
    alt: 'Laptop de alto rendimiento',
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
    alt: 'Profesionales trabajando',
  },
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cambio automático cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className="h-full w-full relative group overflow-hidden rounded-xl shadow-xl">
      {/* Imagen de Fondo */}
      <div className="w-full h-full relative">
         <Image
            src={slides[currentIndex].url}
            alt={slides[currentIndex].alt}
            fill
            className="object-cover transition-all duration-500 ease-in-out"
            priority
          />
          {/* Capa oscura sutil para que resalte si pones texto encima (opcional) */}
          <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Flecha Izquierda */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all">
        <button onClick={prevSlide} type="button">❮</button>
      </div>

      {/* Flecha Derecha */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all">
        <button onClick={nextSlide} type="button">❯</button>
      </div>

      {/* Puntos Indicadores (Dots) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center py-2 gap-2">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`text-2xl cursor-pointer transition-all duration-300 ${
              currentIndex === slideIndex ? 'text-white scale-125' : 'text-white/50 text-xl'
            }`}
          >
            ●
          </div>
        ))}
      </div>
    </div>
  )
}