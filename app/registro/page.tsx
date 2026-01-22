import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Netsystems',
  description: 'Únete a Netsystems y accede a ofertas exclusivas.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-white">
      
      {/* IZQUIERDA: FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Crear una Cuenta 🚀
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Ya eres cliente?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>

      {/* DERECHA: IMAGEN (Solo en PC) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop"
          alt="Workspace Moderno"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/60 flex flex-col justify-end p-16">
          <div className="text-white">
            <h3 className="text-3xl font-bold mb-4">Únete a la comunidad tecnológica</h3>
            <ul className="space-y-3 text-lg opacity-90">
              <li className="flex items-center gap-2">✓ Ofertas exclusivas</li>
              <li className="flex items-center gap-2">✓ Historial de pedidos</li>
              <li className="flex items-center gap-2">✓ Soporte prioritario</li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  )
}