import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils' 
import { AddToCartButton } from '@/components/products/AddToCartButton'
import ProductGallery from '@/components/products/ProductGallery'
import { CheckCircle2, PackagePlus, Cpu, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import RelatedProducts from '@/components/products/RelatedProducts' // 👇 IMPORTAR

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
    USED: { label: 'Usado', class: 'bg-orange-100 text-orange-800' },
    REFURBISHED: { label: 'Reacondicionado', class: 'bg-purple-100 text-purple-800' }
  };
  // @ts-ignore
  const conditionInfo = conditionLabels[product.condition] || conditionLabels.NEW;

  // --- 🆕 LÓGICA DE AHORRO ---
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const savingsAmount = hasDiscount ? (product.originalPrice! - product.price) : 0
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  // LOGICA SPECS
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
    <div className="container mx-auto px-4 py-10 bg-white">
      <div className="grid md:grid-cols-2 gap-12">
        
        {/* --- COLUMNA IZQUIERDA: GALERÍA + BENEFICIOS --- */}
        <div className="flex flex-col gap-8">
           <div className="sticky top-24 z-10">
               <ProductGallery 
                  images={product.images.length > 0 ? product.images : (product.image ? [product.image] : [])} 
                  productName={product.name} 
               />
               
               {/* 👇 AQUÍ LLENAMOS EL ESPACIO BLANCO: CAJA DE CONFIANZA */}
               <div className="mt-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
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

        {/* --- COLUMNA DERECHA: INFO --- */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
             <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${conditionInfo.class}`}>{conditionInfo.label}</span>
             
             {/* 🆕 ETIQUETA DE PORCENTAJE */}
             {hasDiscount && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    ¡Oferta -{discountPercentage}%!
                </span>
             )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
          <p className="text-lg text-gray-500 mb-6 font-medium">{product.brand} {product.model}</p>

          <div className="mb-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Precio Online</p>
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-blue-700">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through decoration-red-400 decoration-2">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                
                {/* 🆕 MENSAJE DE AHORRO */}
                {hasDiscount && (
                    <div className="mt-2 inline-flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-200 flex items-center gap-1">
                            🔥 ¡Ahorras {formatPrice(savingsAmount)}!
                        </span>
                    </div>
                )}
            </div>
            
            {product.stock > 0 ? (
                <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold mb-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        En Stock
                    </span>
                    <p className="text-xs text-gray-400 font-medium">{product.stock} disponibles</p>
                </div>
            ) : (
                <span className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm">Agotado</span>
            )}
          </div>

          {product.conditionDetails && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                  <span className="text-xl mt-0.5">⚠️</span>
                  <div>
                      <h3 className="text-xs font-bold text-amber-900 uppercase">Nota sobre el estado</h3>
                      <p className="text-sm text-amber-800 mt-1 leading-snug">{product.conditionDetails}</p>
                  </div>
              </div>
          )}

          <div className="mb-10">
            {product.stock > 0 && <AddToCartButton product={product} />}
          </div>

          {/* SECCIÓN 1: SPECS FIJAS */}
          {fixedSpecs.length > 0 && (
            <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Especificaciones Principales
                </h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-50">
                        <tbody className="divide-y divide-gray-50">
                            {fixedSpecs.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide w-1/3 bg-gray-50/50">{item.label}</td>
                                    <td className="px-5 py-3.5 text-sm text-gray-800 font-medium">{item.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* DESCRIPCIÓN */}
          {product.description && (
             <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                <div className="prose prose-blue prose-sm text-gray-600 max-w-none bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
             </div>
          )}

          {/* SECCIÓN 2: SPECS EXTRA */}
          {filteredDynamicSpecs.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PackagePlus className="w-5 h-5 text-gray-400" />
                    Información Técnica Adicional
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {filteredDynamicSpecs.map((item, idx) => (
                        <div key={idx} className="flex flex-col border-b border-gray-50 pb-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">{item.label}</span>
                            <span className="text-sm text-gray-700 font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
              </div>
          )}

        </div>
      </div>

      {/* 👇 CARRUSEL DE RELACIONADOS AL FINAL DE TODO */}
      <RelatedProducts currentProductId={product.id} category={product.category} />

    </div>
  )
}