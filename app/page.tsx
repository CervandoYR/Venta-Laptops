import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'
import Image from 'next/image'

export const revalidate = 3600 // Revalidar cada hora

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      featured: true,
      active: true,
    },
    take: 3,
    orderBy: {
      createdAt: 'desc',
    },
  })

  const allProducts = await prisma.product.findMany({
    where: {
      active: true,
    },
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Laptops Premium para Profesionales
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Encuentra la laptop perfecta para tu trabajo. Las mejores marcas, 
                precios competitivos y envío gratis.
              </p>
              <Link
                href="/productos"
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                Ver Catálogo
              </Link>
            </div>
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <div className="text-white text-center p-8">
                <p className="text-4xl mb-2">💻</p>
                <p className="text-2xl font-bold">Laptops Premium</p>
                <p className="text-primary-100 mt-2">La mejor tecnología para tu trabajo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Productos Destacados
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Nuestros Productos</h2>
            <Link
              href="/productos"
              className="btn-outline"
            >
              Ver Todos
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">
                Envío gratuito en compras superiores a $500
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Garantía Oficial</h3>
              <p className="text-gray-600">
                Todos nuestros productos incluyen garantía oficial del fabricante
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Pago Seguro</h3>
              <p className="text-gray-600">
                Procesamiento de pagos seguro con Stripe
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
