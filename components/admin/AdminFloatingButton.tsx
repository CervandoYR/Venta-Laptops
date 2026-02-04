'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function AdminFloatingButton() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const isProductPage = pathname?.includes('/productos/')
  
  // ✅ NUEVO: Si ya estoy dentro del panel admin, no necesito el botón flotante
  const isInAdminPanel = pathname?.startsWith('/admin')

  const bottomPosition = isProductPage 
    ? "bottom-44 md:bottom-8" 
    : "bottom-20 md:bottom-8"

  // Ocultar si no es admin O si ya está dentro del panel
  if (!isAdmin || isInAdminPanel) return null

  return (
    <Link 
      href="/admin" 
      className={`fixed ${bottomPosition} left-4 md:left-8 z-[80] flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:bg-black transition-all duration-300 hover:scale-105 active:scale-95 group border border-gray-700`}
    >
      <div className="relative">
        <ShieldCheck className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
        </span>
      </div>
      
      <span className="font-bold text-sm hidden md:block">Panel de Control</span>
      <span className="font-bold text-sm md:hidden">Admin</span>
    </Link>
  )
}