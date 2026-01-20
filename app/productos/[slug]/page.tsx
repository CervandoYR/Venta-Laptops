import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils' // Asegúrate que esta función exista en tu utils, o usa toFixed
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

  if (!product) return {}

  return {
    title: `${product.name} | Netsystems Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [product.image],
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

  // Configuración de las etiquetas de condición
  const conditionLabels: Record<string, { label: string; class: string }> = {
    NEW: { label: 'Nuevo Sellado', class: 'bg-green-100 text-green-800' },
    LIKE_NEW: { label: 'Como Nuevo', class: 'bg-blue-100 text-blue-800' },
    USED: { label: 'Segunda Mano', class: 'bg-orange-100 text-orange-800' },
    REFURBISHED: { label: 'Reacondicionado', class: 'bg-purple-100 text-purple-800' }
  };

  // Obtenemos la etiqueta actual (o NEW por defecto si falla)
  // @ts-ignore
  const conditionInfo = conditionLabels[product.condition] || conditionLabels.NEW;
  
  // @ts-ignore
  const conditionDetails = product.conditionDetails;

  // Lógica para saber si mostramos specs (Si tiene CPU definido)
  const showSpecs = !!product.cpu;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        
        {/* GALERÍA DE IMÁGENES */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white border flex items-center justify-center">
            {/* Usamos la primera imagen del array o la imagen principal antigua */}
            <Image
              src={product.images[0] || product.image || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-contain p-6"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Miniaturas (Solo si hay más de una imagen) */}
          {product.images && product.images.length > 1 && (
             <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-md overflow-hidden bg-white">
                        <Image 
                          src={img} 
                          alt={`Vista ${idx}`} 
                          fill 
                          className="object-contain p-1"
                          sizes="100px" 
                        />
                    </div>
                ))}
             </div>
          )}
        </div>

        {/* INFORMACIÓN DEL PRODUCTO */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
             {/* Badge de Condición */}
             <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${conditionInfo.class}`}>
                {conditionInfo.label}
             </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-lg text-gray-500 mb-6 font-medium">
            {product.brand} {product.model}
          </p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Alerta de detalles (Solo si no es nuevo) */}
          {conditionDetails && (
              <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
                  <div className="flex">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900 uppercase">Detalles del estado:</h3>
                        <p className="text-sm text-amber-800 mt-1">{conditionDetails}</p>
                    </div>
                  </div>
              </div>
          )}

          {/* STOCK Y BOTÓN */}
          <div className="mb-8">
            {product.stock > 0 ? (
                <>
                    <p className="text-sm text-green-600 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Disponible: {product.stock} unidades
                    </p>
                    <AddToCartButton product={product} />
                </>
            ) : (
                <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-md font-bold cursor-not-allowed">
                    Agotado
                </button>
            )}
          </div>

          {/* DESCRIPCIÓN CORTA */}
          <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line">
            <p>{product.description}</p>
          </div>

          {/* TABLA DE ESPECIFICACIONES (Solo si aplica) */}
          {showSpecs && (
              <div className="border-t pt-8 mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Especificaciones Técnicas</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                        {product.cpu && (
                            <tr>
                                <td className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100 w-1/3">Procesador</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{product.cpu}</td>
                            </tr>
                        )}
                        {product.ram && (
                            <tr>
                                <td className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100">RAM</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{product.ram}</td>
                            </tr>
                        )}
                        {product.storage && (
                            <tr>
                                <td className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100">Almacenamiento</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{product.storage}</td>
                            </tr>
                        )}
                        {product.display && (
                            <tr>
                                <td className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100">Pantalla</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{product.display}</td>
                            </tr>
                        )}
                        {product.gpu && (
                            <tr>
                                <td className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-100">Gráficos</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{product.gpu}</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
              </div>
          )}

        </div>
      </div>
    </div>
  )
}