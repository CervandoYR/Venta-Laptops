import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Netsystems',
  description: 'Accede a tu cuenta y gestiona tus pedidos.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-white">
      
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bienvenido de nuevo 👋
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/registro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <LoginForm />
          
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400">
              Al continuar, aceptas nuestros <Link href="#" className="underline hover:text-gray-500">Términos de Servicio</Link> y <Link href="#" className="underline hover:text-gray-500">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: IMAGEN (Solo en PC) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop"
          alt="Laptop Premium"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-16">
          <blockquote className="relative">
            <p className="text-2xl font-medium text-white leading-relaxed">
              "La potencia que necesitas para tus proyectos más exigentes. Encuentra tu equipo ideal hoy mismo."
            </p>
            <footer className="mt-4">
              <p className="text-base font-semibold text-blue-400">Servitek Technologies</p>
            </footer>
          </blockquote>
        </div>
      </div>
      
    </div>
  )
}