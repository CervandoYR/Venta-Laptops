'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
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

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            Netsystems
          </Link>

          {/* Desktop Navigation */}
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

            {/* 👇 AQUÍ AGREGAMOS EL ENLACE */}
            <Link href="/metodos-pago" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Métodos de Pago
            </Link>
            
            {session?.user && (
              <>
                <Link href="/pedidos" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Mis Pedidos
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium transition">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side Actions */}
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
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{session.user.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Ingresar
                </Link>
                <Link href="/registro" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-down">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              
              <div className="px-4 py-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">Categorías</div>
              {categories.map((cat) => (
                 <Link 
                    key={cat.name} 
                    href={cat.href} 
                    className="pl-8 pr-4 py-2 text-gray-600 hover:text-blue-600 block"
                    onClick={() => setMobileMenuOpen(false)}
                 >
                    {cat.name}
                 </Link>
              ))}

              <Link href="/nosotros" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Nosotros
              </Link>

              {/* 👇 TAMBIÉN EN MÓVIL */}
              <Link href="/metodos-pago" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Métodos de Pago
              </Link>

              <div className="border-t my-2"></div>

              {session?.user ? (
                <>
                  <Link href="/pedidos" className="px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    Mis Pedidos
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="px-4 py-2 text-purple-600 font-medium hover:bg-purple-50" onClick={() => setMobileMenuOpen(false)}>
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-left px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/registro" className="mx-4 mt-2 bg-blue-600 text-center text-white py-2 rounded-md font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}