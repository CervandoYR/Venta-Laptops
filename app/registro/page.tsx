import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Registrarse',
  description: 'Crea tu cuenta en Servitek Technologies',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Inicia sesión aquí
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
