import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/products/AddToCartButton'

type Props = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) {
    return {}
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product || !product.active) {
    notFound()
  }

  // Schema.org Product markup
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MXN',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Imagen */}
          <div className="relative h-96 md:h-[600px] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image || 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Sin+Imagen'}
              alt={product.name}
              fill
              className="object-contain p-8"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Sin+Imagen'
              }}
            />
          </div>

          {/* Información */}
          <div>
            <div className="mb-4">
              <span className="text-primary-600 font-semibold">{product.brand}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="mb-8">
              {product.stock > 0 ? (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  En Stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Agotado
                </span>
              )}
            </div>

            <AddToCartButton product={product} />

            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Especificaciones</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">Marca</dt>
                  <dd className="font-semibold">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Modelo</dt>
                  <dd className="font-semibold">{product.model}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Procesador</dt>
                  <dd className="font-semibold">{product.cpu}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">RAM</dt>
                  <dd className="font-semibold">{product.ram}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Almacenamiento</dt>
                  <dd className="font-semibold">{product.storage}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Pantalla</dt>
                  <dd className="font-semibold">{product.display}</dd>
                </div>
                {product.gpu && (
                  <div>
                    <dt className="text-sm text-gray-600">Tarjeta Gráfica</dt>
                    <dd className="font-semibold">{product.gpu}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-12 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-4">Descripción</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>
    </>
  )
}
