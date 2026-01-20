import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@prisma/client'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/productos/${product.slug}`}>
      <div className="card hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-100">
          <Image
            src={product.image || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Sin+Imagen'}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Sin+Imagen'
            }}
          />
          {product.featured && (
            <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
              Destacado
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.brand} - {product.model}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">En stock</span>
            ) : (
              <span className="text-sm text-red-600">Agotado</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
