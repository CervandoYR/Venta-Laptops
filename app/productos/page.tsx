import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo completo de laptops premium - MacBook, Dell, HP, Lenovo y más',
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Nuestro Catálogo</h1>
        <p className="text-gray-600 text-lg">
          Descubre nuestra selección de laptops premium
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
