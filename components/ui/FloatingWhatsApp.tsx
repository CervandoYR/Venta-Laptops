'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function FloatingWhatsApp() {
  // Configura aquí tu número real
  const whatsappNumber = "51999999999" 
  const defaultMessage = "Hola Netsystems, estoy interesado en comprar una laptop."

  return (
    <Link
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      // ✅ UX FIX MEJORADO: Pasamos de bottom-24 a bottom-32 en móvil.
      // Esto le da un "respiro" visual perfecto por encima de la barra de comprar.
      // md:bottom-8 mantiene la posición estándar en computadoras.
      className="fixed bottom-32 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-[0_8px_20px_rgba(37,211,102,0.3)] hover:bg-[#1fb355] transition-all duration-300 hover:scale-105 active:scale-95 group"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 text-white group-hover:animate-bounce" />
        {/* Punto verde "En Línea" */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-[#25D366]"></span>
        </span>
      </div>
      
      <span className="font-bold text-sm hidden md:block">¿Dudas? Escríbenos</span>
      <span className="font-bold text-sm md:hidden">Ayuda</span>
    </Link>
  )
}