import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils' 
import { AddToCartButton } from '@/components/products/AddToCartButton'
import ProductGallery from '@/components/products/ProductGallery'
import { CheckCircle2, PackagePlus, Cpu, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import RelatedProducts from '@/components/products/RelatedProducts'

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

  const conditionLabels: Record<string, { label: string; class: string }> = {
    NEW: { label: 'Nuevo Sellado', class: 'bg-green-100 text-green-800' },
    LIKE_NEW: { label: 'Como Nuevo', class: 'bg-blue-100 text-blue-800' },
    USED: { label: 'Usado', class: 'bg-orange-100 text-orange-800' },
    REFURBISHED: { label: 'Reacondicionado', class: 'bg-purple-100 text-purple-800' }
  };
  // @ts-ignore
  const conditionInfo = conditionLabels[product.condition] || conditionLabels.NEW;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const savingsAmount = hasDiscount ? (product.originalPrice! - product.price) : 0
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const fixedSpecs = [
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
  ].filter(s => s.value); 

  let dynamicSpecs: { label: string, value: string }[] = [];
  if (product.specifications && typeof product.specifications === 'object') {
      dynamicSpecs = Object.entries(product.specifications).map(([key, value]) => ({
          label: key, value: String(value)
      }));
  }

  const filteredDynamicSpecs = dynamicSpecs.filter(ds => 
      !fixedSpecs.some(fs => fs.label.toLowerCase().includes(ds.label.toLowerCase()) || ds.label.toLowerCase().includes(fs.label.toLowerCase()))
  );

  return (
    <>
      {/* ✅ ESCUDO RESPONSIVE: 'w-full max-w-[100vw] overflow-x-hidden' 
          Esto bloquea cualquier scroll horizontal no deseado a nivel de página */}
      <div className="w-full max-w-[100vw] overflow-x-hidden bg-white">
        
        {/* Contenedor principal con espaciado ajustado para móviles (px-4) */}
        <div className="container mx-auto px-4 py-8 md:py-10 pb-28 md:pb-10">
          
          {/* ✅ GAP REDUCIDO: de gap-12 a gap-8 en móvil para que no se sienta tan separado */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* --- COLUMNA IZQUIERDA: GALERÍA + BENEFICIOS --- */}
            <div className="flex flex-col gap-6 md:gap-8 min-w-0"> {/* min-w-0 evita desbordes en grid */}
              <div className="md:sticky md:top-24 z-10 w-full">
                  <ProductGallery 
                      images={product.images.length > 0 ? product.images : (product.image ? [product.image] : [])} 
                      productName={product.name} 
                  />
                  
                  {/* CAJA DE CONFIANZA */}
                  <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 md:p-6 border border-blue-100 hidden md:block">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-blue-600" /> 
                          Compra con Confianza
                      </h4>
                      <div className="space-y-4">
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-full shadow-sm text-blue-600"><Truck className="w-4 h-4" /></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800">Envío Gratis en Lima</p>
                                  <p className="text-xs text-gray-500">Recibe tu pedido en 24-48 horas hábiles.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-full shadow-sm text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800">Garantía Asegurada</p>
                                  <p className="text-xs text-gray-500">Todos nuestros equipos cuentan con garantía real.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-full shadow-sm text-blue-600"><CreditCard className="w-4 h-4" /></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800">Pago Seguro</p>
                                  <p className="text-xs text-gray-500">Aceptamos transferencias, Yape y tarjetas.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            {/* --- COLUMNA DERECHA: INFO DEL PRODUCTO --- */}
            <div className="flex flex-col w-full min-w-0"> {/* min-w-0 crucial para prevenir overflow */}
              
              <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${conditionInfo.class}`}>{conditionInfo.label}</span>
                
                {hasDiscount && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        ¡Oferta -{discountPercentage}%!
                    </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight break-words">{product.name}</h1>
              <p className="text-base md:text-lg text-gray-500 mb-6 font-medium break-words">{product.brand} {product.model}</p>

              {/* ✅ CAJA DE PRECIO Y STOCK OPTIMIZADA */}
              <div className="mb-6 w-full p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Precio Online</p>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 leading-none">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through decoration-red-400 decoration-2">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>
                    {hasDiscount && (
                        <div className="mt-1.5">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold border border-red-200 inline-flex items-center gap-1 whitespace-nowrap">
                                🔥 ¡Ahorras {formatPrice(savingsAmount)}!
                            </span>
                        </div>
                    )}
                </div>
                
                {product.stock > 0 ? (
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold mb-1 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            En Stock
                        </span>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium whitespace-nowrap">
                          {product.stock} disp.
                        </p>
                    </div>
                ) : (
                    <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">Agotado</span>
                )}
              </div>

              {product.conditionDetails && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start w-full">
                      <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
                      <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-amber-900 uppercase">Nota sobre el estado</h3>
                          <p className="text-sm text-amber-800 mt-1 leading-snug break-words">{product.conditionDetails}</p>
                      </div>
                  </div>
              )}

              {/* BOTÓN ESCRITORIO */}
              <div className="mb-10 hidden md:block w-full">
                {product.stock > 0 && <AddToCartButton product={product} />}
              </div>

              {/* ✅ TABLA DE ESPECIFICACIONES CON PROTECCIÓN CONTRA OVERFLOW */}
              {fixedSpecs.length > 0 && (
                <div className="mb-8 w-full max-w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Cpu className="w-5 h-5 text-blue-600" />
                        Especificaciones
                    </h3>
                    {/* El overflow-x-auto permite deslizar la tabla si es muy ancha, sin mover la página */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-50 table-fixed sm:table-auto">
                            <tbody className="divide-y divide-gray-50">
                                {fixedSpecs.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-1/3 min-w-[120px] bg-gray-50/50">{item.label}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 font-medium break-words">{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              )}

              {/* ✅ DESCRIPCIÓN HTML CON PROTECCIÓN CONTRA OVERFLOW */}
              {product.description && (
                <div className="mb-8 w-full max-w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                    {/* El overflow-x-auto y break-words protegen de imágenes o tablas HTML mal formateadas */}
                    <div className="prose prose-blue prose-sm text-gray-600 max-w-full bg-gray-50/50 p-4 md:p-5 rounded-xl border border-gray-100 overflow-x-auto break-words [&>img]:max-w-full [&>table]:w-full">
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                </div>
              )}

              {/* SPECS EXTRA */}
              {filteredDynamicSpecs.length > 0 && (
                  <div className="mt-4 pt-6 border-t border-gray-100 w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PackagePlus className="w-5 h-5 text-gray-400" />
                        Más Detalles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 w-full">
                        {filteredDynamicSpecs.map((item, idx) => (
                            <div key={idx} className="flex flex-col border-b border-gray-50 pb-2 w-full min-w-0">
                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 truncate">{item.label}</span>
                                <span className="text-sm text-gray-700 font-medium break-words">{item.value}</span>
                            </div>
                        ))}
                    </div>
                  </div>
              )}

            </div>
          </div>

          <RelatedProducts currentProductId={product.id} category={product.category} />

        </div>
      </div>

      {/* 📱 BARRA FLOTANTE MÓVIL (STICKY BOTTOM) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between">
          <div className="flex flex-col justify-center min-w-0 mr-2">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-none mb-1">Precio total</p>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700 leading-none truncate">{formatPrice(product.price)}</span>
          </div>
          <div className="w-[160px] sm:w-[200px] flex-shrink-0">
              {product.stock > 0 ? (
                  <AddToCartButton product={product} /> 
              ) : (
                  <span className="block w-full text-center bg-gray-200 text-gray-500 py-3 rounded-xl font-bold text-sm">Agotado</span>
              )}
          </div>
      </div>
    </>
  )
}