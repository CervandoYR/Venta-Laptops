'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation' // 👈 1. IMPORTAMOS usePathname
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  
  const pathname = usePathname() // 👈 2. OBTENEMOS LA RUTA ACTUAL

  const categories = [
    { name: 'Laptops', href: '/?category=Laptops' },
    { name: 'PC Escritorio', href: '/?category=PC Escritorio' },
    { name: 'Monitores', href: '/?category=Monitores' },
    { name: 'Periféricos', href: '/?category=Periféricos' },
    { name: 'Componentes', href: '/?category=Componentes' },
  ]

  const getUserName = () => {
    if (!session?.user?.name) return 'Usuario'
    return session.user.name.split(' ')[0]
  }

  // 👈 3. FUNCIÓN AYUDANTE PARA EL ESTADO ACTIVO
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            Netsystems
          </Link>

          {/* MENÚ ESCRITORIO */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              href="/" 
              className={`transition font-medium ${isActive('/') ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Inicio
            </Link>
            
            {/* Dropdown Categorías */}
            <div className="relative group">
              <button 
                className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
              >
                Categorías <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              <div 
                className={`absolute top-full left-0 w-48 bg-white border shadow-lg rounded-md py-2 mt-1 transition-all duration-200 transform origin-top-left ${categoriesOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                {categories.map((cat) => (
                  <Link 
                    key={cat.name} 
                    href={cat.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link 
              href="/nosotros" 
              className={`transition font-medium ${isActive('/nosotros') ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Nosotros
            </Link>

            <Link 
              href="/metodos-pago" 
              className={`transition font-medium ${isActive('/metodos-pago') ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Métodos de Pago
            </Link>

            <Link 
              href="/contacto" 
              className={`transition font-medium ${isActive('/contacto') ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Contáctanos
            </Link>
            
            {session?.user && (
              <>
                <Link 
                  href="/pedidos" 
                  className={`transition font-medium ${isActive('/pedidos') ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Mis Pedidos
                </Link>
                {(session.user as any).role === 'ADMIN' && (
                  <Link href="/admin" className={`font-medium transition flex items-center gap-1 ${isActive('/admin') ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-1' : 'text-purple-600 hover:text-purple-700'}`}>
                    🛡️ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-blue-600 transition">
              <ShoppingCart className={`w-6 h-6 ${isActive('/carrito') ? 'text-blue-600 fill-blue-50' : ''}`} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Usuario (Escritorio) */}
            {session ? (
              <div className="hidden md:flex items-center space-x-4 pl-4 border-l">
                <Link 
                  href="/perfil"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors cursor-pointer group ${isActive('/perfil') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  <div className={`p-1 rounded-full transition-colors ${isActive('/perfil') ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                    <User className={`w-5 h-5 ${isActive('/perfil') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  </div>
                  <span className={isActive('/perfil') ? 'font-bold' : ''}>{getUserName()}</span>
                </Link>
                <button onClick={() => signOut()} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar Sesión"><LogOut className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Ingresar</Link>
                <Link href="/registro" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow">Registrarse</Link>
              </div>
            )}

            <button className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menú">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <><Menu className="w-6 h-6" /><span className="text-sm font-bold">Menú</span></>}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-down bg-white absolute left-0 right-0 shadow-xl border-b z-50">
            <div className="flex flex-col space-y-1 container mx-auto px-4">
              
              {session?.user && (
                <div className="pb-4 mb-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Bienvenido,</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">{getUserName().charAt(0)}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{session.user.name}</p>
                      <Link href="/perfil" className="text-xs text-blue-600 hover:underline" onClick={() => setMobileMenuOpen(false)}>Ver mi perfil</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* 👈 4. ESTILOS ACTIVOS MÓVIL */}
              <Link href="/" className={`px-4 py-3 rounded-md font-medium transition ${isActive('/') ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              
              <div className="px-4 py-2 font-bold text-gray-400 text-xs uppercase tracking-wider mt-2">Categorías</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {categories.map((cat) => (
                   <Link key={cat.name} href={cat.href} className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>{cat.name}</Link>
                ))}
              </div>

              <Link href="/nosotros" className={`px-4 py-3 rounded-md font-medium transition ${isActive('/nosotros') ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
              <Link href="/metodos-pago" className={`px-4 py-3 rounded-md font-medium transition ${isActive('/metodos-pago') ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Métodos de Pago</Link>
              <Link href="/contacto" className={`px-4 py-3 rounded-md font-medium transition ${isActive('/contacto') ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Contáctanos</Link>

              <div className="border-t my-2 border-gray-100"></div>

              {session?.user ? (
                <>
                  <Link href="/pedidos" className={`px-4 py-3 font-medium flex items-center gap-2 rounded-md ${isActive('/pedidos') ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>📦 Mis Pedidos</Link>
                  {(session.user as any).role === 'ADMIN' && (
                    <Link href="/admin" className={`px-4 py-3 font-medium flex items-center gap-2 rounded-md ${isActive('/admin') ? 'bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600' : 'text-purple-600 hover:bg-purple-50'}`} onClick={() => setMobileMenuOpen(false)}>🛡️ Panel Admin</Link>
                  )}
                  <button onClick={() => signOut()} className="text-left px-4 py-3 text-red-600 hover:bg-red-50 w-full font-medium flex items-center gap-2 mt-2"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2 p-2">
                  <Link href="/login" className="w-full text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Link>
                  <Link href="/registro" className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>Registrarse Gratis</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}