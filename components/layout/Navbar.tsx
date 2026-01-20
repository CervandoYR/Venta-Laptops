'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Servitek
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/productos" className="text-gray-700 hover:text-primary-600 transition">
              Productos
            </Link>
            
            {session?.user && (
              <>
                <Link href="/pedidos" className="text-gray-700 hover:text-primary-600 transition">
                  Mis Pedidos
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/carrito"
              className="relative p-2 text-gray-700 hover:text-primary-600 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/perfil"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition"
                >
                  <User className="w-5 h-5" />
                  <span>{session.user.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary text-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login" className="btn-outline text-sm">
                  Iniciar Sesión
                </Link>
                <Link href="/registro" className="btn-primary text-sm">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/productos" className="text-gray-700 hover:text-primary-600">
                Productos
              </Link>
              {session?.user && (
                <>
                  <Link href="/pedidos" className="text-gray-700 hover:text-primary-600">
                    Mis Pedidos
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-700 hover:text-primary-600">
                      Admin
                    </Link>
                  )}
                  <Link href="/perfil" className="text-gray-700 hover:text-primary-600">
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="btn-secondary text-left"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
              {!session && (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-primary-600">
                    Iniciar Sesión
                  </Link>
                  <Link href="/registro" className="text-gray-700 hover:text-primary-600">
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
