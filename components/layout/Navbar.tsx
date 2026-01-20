'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const categories = [
    { name: 'Laptops', href: '/?category=Laptops' },
    { name: 'PC Escritorio', href: '/?category=PC Escritorio' },
    { name: 'Monitores', href: '/?category=Monitores' },
    { name: 'Periféricos', href: '/?category=Periféricos' },
    { name: 'Componentes', href: '/?category=Componentes' },
  ]

  // Función auxiliar para obtener el primer nombre
  const getUserName = () => {
    if (!session?.user?.name) return 'Usuario'
    return session.user.name.split(' ')[0] // "Juan Perez" -> "Juan"
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
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
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

            <Link href="/nosotros" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Nosotros
            </Link>

            <Link href="/metodos-pago" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Métodos de Pago
            </Link>
            
            {session?.user && (
              <>
                <Link href="/pedidos" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Mis Pedidos
                </Link>
                {/* Si es Admin, mostramos el enlace al Panel */}
                {(session.user as any).role === 'ADMIN' && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium transition flex items-center gap-1">
                    🛡️ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center space-x-6">
            <Link
              href="/carrito"
              className="relative p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="hidden md:flex items-center space-x-4 pl-4 border-l">
                {/* ENLACE AL PERFIL CON NOMBRE */}
                <Link 
                  href="/perfil"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <div className="bg-gray-100 p-1 rounded-full group-hover:bg-blue-100 transition-colors">
                    <User className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <span>{getUserName()}</span>
                </Link>
                
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Ingresar
                </Link>
                <Link href="/registro" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Botón Menú Móvil */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-down bg-white absolute left-0 right-0 shadow-xl border-b z-50">
            <div className="flex flex-col space-y-1 container mx-auto px-4">
              
              {/* CABECERA DEL MENÚ MÓVIL (Con el Nombre) */}
              {session?.user && (
                <div className="pb-4 mb-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Bienvenido,</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {getUserName().charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{session.user.name}</p>
                      <Link href="/perfil" className="text-xs text-blue-600 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                        Ver mi perfil
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/" className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              
              {/* Categorías Móvil */}
              <div className="px-4 py-2 font-bold text-gray-400 text-xs uppercase tracking-wider mt-2">Categorías</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {categories.map((cat) => (
                   <Link 
                      key={cat.name} 
                      href={cat.href} 
                      className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                   >
                      {cat.name}
                   </Link>
                ))}
              </div>

              <Link href="/nosotros" className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium" onClick={() => setMobileMenuOpen(false)}>
                Nosotros
              </Link>
              
              <Link href="/metodos-pago" className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium" onClick={() => setMobileMenuOpen(false)}>
                Métodos de Pago
              </Link>

              <div className="border-t my-2 border-gray-100"></div>

              {session?.user ? (
                <>
                  <Link href="/pedidos" className="px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    📦 Mis Pedidos
                  </Link>
                  {(session.user as any).role === 'ADMIN' && (
                    <Link href="/admin" className="px-4 py-3 text-purple-600 font-medium hover:bg-purple-50 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      🛡️ Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-left px-4 py-3 text-red-600 hover:bg-red-50 w-full font-medium flex items-center gap-2 mt-2"
                  >
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2 p-2">
                  <Link href="/login" className="w-full text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/registro" className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>
                    Registrarse Gratis
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}