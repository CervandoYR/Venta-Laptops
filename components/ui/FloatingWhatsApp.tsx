'use client'

import { MessageCircle } from 'lucide-react'

export default function FloatingWhatsApp() {
  // ⚠️ CAMBIA ESTE NÚMERO
  const phoneNumber = '51926870309' 
  const message = 'Hola Servitek, estoy viendo su página web y tengo una consulta...'

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 group flex items-center gap-2 animate-bounce-subtle"
      aria-label="Chat en WhatsApp"
    >
      <MessageCircle className="w-8 h-8 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm">
        ¡Chatea con nosotros!
      </span>
    </a>
  )
}