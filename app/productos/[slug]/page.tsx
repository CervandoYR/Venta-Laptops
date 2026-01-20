import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils' 
import { AddToCartButton } from '@/components/products/AddToCartButton'
import ProductGallery from '@/components/products/ProductGallery' // Tu galería interactiva

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
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
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product || !product.active) notFound()

  // Etiquetas de condición
  const conditionLabels: Record<string, { label: string; class: string }> = {
    NEW: { label: 'Nuevo Sellado', class: 'bg-green-100 text-green-800' },
    LIKE_NEW: { label: 'Como Nuevo', class: 'bg-blue-100 text-blue-800' },
    USED: { label: 'Segunda Mano', class: 'bg-orange-100 text-orange-800' },
    REFURBISHED: { label: 'Reacondicionado', class: 'bg-purple-100 text-purple-800' }
  };
  // @ts-ignore
  const conditionInfo = conditionLabels[product.condition] || conditionLabels.NEW;

  // Mostramos tabla si tiene al menos un dato técnico importante
  const showSpecs = product.cpu || product.ram || product.display || product.connectivity;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        
        {/* GALERÍA */}
        <div>
           <ProductGallery 
              images={product.images.length > 0 ? product.images : (product.image ? [product.image] : [])} 
              productName={product.name} 
           />
        </div>

        {/* INFO PRODUCTO */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">{product.category}</span>
             <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${conditionInfo.class}`}>{conditionInfo.label}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-lg text-gray-500 mb-6 font-medium">{product.brand} {product.model}</p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          </div>

          {product.conditionDetails && (
              <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
                  <div className="flex">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900 uppercase">Detalles del estado:</h3>
                        <p className="text-sm text-amber-800 mt-1">{product.conditionDetails}</p>
                    </div>
                  </div>
              </div>
          )}

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
                <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-md font-bold cursor-not-allowed">Agotado</button>
            )}
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line">
            <p>{product.description}</p>
          </div>

          {/* TABLA DE ESPECIFICACIONES COMPLETA */}
          {showSpecs && (
              <div className="border-t pt-8 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Especificaciones Técnicas</h3>
                <div className="bg-white rounded-lg overflow-hidden border shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                        {[
                            { label: 'Procesador', value: product.cpu },
                            { label: 'Memoria RAM', value: product.ram },
                            { label: 'Almacenamiento', value: product.storage },
                            { label: 'Pantalla', value: product.display },
                            { label: 'Gráficos (Video)', value: product.gpu },
                            { label: 'Conectividad', value: product.connectivity },
                            { label: 'Puertos', value: product.ports },
                            { label: 'Batería', value: product.battery },
                            { label: 'Sonido', value: product.sound },
                            { label: 'Dimensiones', value: product.dimensions },
                            { label: 'Peso', value: product.weight },
                        ].map((item, idx) => (
                            item.value ? (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-600 w-1/3">{item.label}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.value}</td>
                                </tr>
                            ) : null
                        ))}
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