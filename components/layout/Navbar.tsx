'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, ShieldCheck, Home, Phone, Truck, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import SearchBar from '@/components/ui/SearchBar'

export function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const pathname = usePathname() 

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const categories = [
    { name: 'Laptops', href: '/?category=Laptops' },
    { name: 'PC Escritorio', href: '/?category=PC Escritorio' },
    { name: 'Monitores', href: '/?category=Monitores' },
    { name: 'Periféricos', href: '/?category=Periféricos' },
    { name: 'Componentes', href: '/?category=Componentes' },
  ]

  const getUserName = () => session?.user?.name ? session.user.name.split(' ')[0] : 'Usuario'
  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  // Número de WhatsApp (Formato limpio)
  const whatsappNumber = "51924076526"

  return (
    <>
      {/* =========================================================
          ✅ TOP BAR (ESTÁTICA): Se va al hacer scroll.
          Mejorada para móvil: Centrada y con iconos claros.
      ========================================================= */}
      <div className="bg-gray-900 text-white py-2 text-[10px] md:text-xs font-medium relative z-[61] border-b border-gray-800">
        <div className="container mx-auto px-4 flex justify-center md:justify-between items-center">
          
          {/* IZQUIERDA: DATOS CLAVE */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* 1. WhatsApp (Resaltado en Móvil) */}
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-green-400 transition-colors group cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-green-400" /> 
              <span className="text-gray-300 group-hover:text-green-400 hidden sm:inline">Venta / WhatsApp:</span> 
              <span className="font-bold tracking-wide text-white group-hover:text-green-400">924-076-526</span>
            </a>

            <span className="w-px h-3 bg-gray-700"></span>

            {/* 2. Envíos (Texto corto en móvil) */}
            <span className="flex items-center gap-1.5 text-blue-300 font-bold">
              <Truck className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">Envíos GRATIS &gt; S/ 500</span>
              <span className="sm:hidden">Envíos Gratis</span>
            </span>

            {/* 3. Garantía (Solo PC) */}
            <span className="hidden lg:flex items-center gap-1.5 text-emerald-400 font-bold border-l border-gray-700 pl-6">
              <ShieldCheck className="w-3.5 h-3.5" /> 
              <span>Garantía Asegurada</span>
            </span>

          </div>

          {/* DERECHA: ENLACES SECUNDARIOS (Solo PC) */}
          <div className="hidden md:flex items-center gap-6 text-gray-400">
            <Link href="/contacto" className="hover:text-white transition text-[11px]">Centro de Ayuda</Link>
            <Link href="/pedidos" className="hover:text-white transition text-[11px]">Rastrea tu pedido</Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVBAR PRINCIPAL (STICKY): Se queda pegado.
      ========================================================= */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-[60]">
        <div className="container mx-auto px-4">
          
          {/* --- FILA 1: LOGO + BUSCADOR + ICONOS --- */}
          <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3 md:gap-8">
            
            {/* LOGO & Controles Móviles */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <Link href="/" className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-tight hover:opacity-80 transition flex-shrink-0">
                Netsystems
              </Link>

              {/* Botones Móvil (Carrito y Menú) */}
              <div className="flex md:hidden items-center gap-2">
                {/* Carrito Móvil Mejorado */}
                <Link href="/carrito" className="relative flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-all border border-blue-100">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Botón Menú Explícito */}
                <button 
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg active:scale-95 transition-all font-bold text-xs uppercase tracking-wide border border-gray-200" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  <span>Menú</span>
                </button>
              </div>
            </div>

            {/* BUSCADOR SIEMPRE VISIBLE */}
            <div className="w-full md:max-w-2xl flex-1">
              <SearchBar />
            </div>

            {/* ICONOS PC */}
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              {session ? (
                <div className="flex items-center gap-3">
                  <Link href="/perfil" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition group">
                    <div className="p-1.5 bg-gray-50 rounded-full border border-gray-100 group-hover:border-blue-200 transition-colors">
                      <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-700 max-w-[100px] truncate">{getUserName()}</span>
                  </Link>
                  <button onClick={() => signOut()} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión"><LogOut className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600">Ingresar</Link>
                  <Link href="/registro" className="bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm active:scale-95">Crear cuenta</Link>
                </div>
              )}

              <Link href="/carrito" className="relative p-2 text-gray-700 hover:text-blue-600 transition flex items-center group">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle shadow-sm border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* --- FILA 2: NAVEGACIÓN PC CENTRADA --- */}
          <div className="hidden md:flex items-center justify-center space-x-10 h-12 border-t border-gray-100 text-sm font-medium">
            
            <Link href="/" className={`flex items-center gap-1.5 transition ${isActive('/') ? 'text-blue-600 font-extrabold' : 'text-gray-600 hover:text-blue-600'}`}>
              <Home className="w-4 h-4" /> Inicio
            </Link>

            <div className="relative group h-full flex items-center">
              <button 
                className="flex items-center text-gray-600 hover:text-blue-600 transition h-full"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
              >
                <Menu className="w-4 h-4 mr-1.5" /> Categorías <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-100 shadow-xl rounded-b-xl py-2 transition-all duration-200 z-[80] ${categoriesOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                {categories.map((cat) => (
                  <Link key={cat.name} href={cat.href} className="block px-5 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors" onClick={() => setCategoriesOpen(false)}>{cat.name}</Link>
                ))}
              </div>
            </div>

            <Link href="/nosotros" className={`transition ${isActive('/nosotros') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Nosotros</Link>
            <Link href="/metodos-pago" className={`transition ${isActive('/metodos-pago') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Métodos de Pago</Link>
            <Link href="/contacto" className={`transition ${isActive('/contacto') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Ayuda y Soporte</Link>
            
            {session?.user && (
              <Link href="/pedidos" className={`transition ${isActive('/pedidos') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Mis Pedidos</Link>
            )}

            {isAdmin && (
              <Link href="/admin" className={`flex items-center gap-1.5 transition ${isActive('/admin') ? 'text-purple-700 font-extrabold' : 'text-purple-600/80 hover:text-purple-700 font-bold'}`}>
                <ShieldCheck className="w-4 h-4" /> Panel Admin
              </Link>
            )}
          </div>

          {/* --- MENÚ MÓVIL --- */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-down bg-white absolute left-0 right-0 shadow-xl border-b z-50 h-[calc(100vh-130px)] overflow-y-auto">
              <div className="flex flex-col space-y-1 container mx-auto px-4 pb-20">
                
                {session?.user ? (
                  <div className="pb-6 mb-4 border-b border-gray-100 mt-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">{getUserName().charAt(0)}</div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Bienvenido</p>
                        <p className="font-bold text-gray-900 text-lg">{session.user.name}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href="/perfil" className="flex-1 text-center text-xs font-bold bg-gray-50 text-gray-700 py-2.5 rounded-xl border border-gray-200">Mi Perfil</Link>
                      <button onClick={() => signOut()} className="flex-1 text-center text-xs font-bold bg-red-50 text-red-600 py-2.5 rounded-xl border border-red-100">Salir</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6 mt-2">
                    <Link href="/login" className="text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm">Ingresar</Link>
                    <Link href="/registro" className="text-center bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200">Registrarse</Link>
                  </div>
                )}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-2">Menú Principal</p>
                <Link href="/" className={`px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Home className="w-5 h-5" /> Inicio
                </Link>
                <Link href="/nosotros" className={`px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive('/nosotros') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Nosotros</Link>
                <Link href="/contacto" className={`px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive('/contacto') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Contáctanos</Link>
                
                {session?.user && (
                  <Link href="/pedidos" className={`px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive('/pedidos') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Mis Pedidos</Link>
                )}

                {isAdmin && (
                  <Link href="/admin" className={`px-4 py-3 mt-2 rounded-xl font-extrabold flex items-center gap-2 ${isActive('/admin') ? 'bg-purple-100 text-purple-800' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                    <ShieldCheck className="w-5 h-5" /> Panel Admin
                  </Link>
                )}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-6">Categorías</p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                     <Link key={cat.name} href={cat.href} className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl font-medium border border-transparent hover:border-gray-100">{cat.name}</Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ BOTÓN ADMIN FLOTANTE */}
      {isAdmin && (
        <Link 
          href="/admin" 
          className="fixed bottom-6 left-4 md:left-6 z-[80] flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(147,51,234,0.3)] hover:scale-105 hover:bg-purple-700 transition-all duration-300 group font-bold text-sm"
        >
          <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:block">Panel de Administración</span>
          <span className="block md:hidden">Admin</span>
        </Link>
      )}
    </>
  )
}