import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-custom py-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link href="/" className="btn-primary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
