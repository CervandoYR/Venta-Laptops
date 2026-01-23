import { prisma } from '@/lib/prisma'
import { ProductCard } from './ProductCard'

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export default async function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  // Buscamos hasta 4 productos de la misma categoría
  const related = await prisma.product.findMany({
    where: {
      category,
      id: { not: currentProductId }, // Excluir el producto actual
      active: true,
      stock: { gt: 0 }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  if (related.length === 0) return null

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">También te podría interesar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {related.map((product) => (
          // @ts-ignore - ProductCard espera tipos un poco diferentes a veces, ignoramos para simplificar
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}