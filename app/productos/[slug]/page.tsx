import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils' 
import { AddToCartButton } from '@/components/products/AddToCartButton'
import ProductGallery from '@/components/products/ProductGallery'
import { CheckCircle2, PackagePlus, Cpu, ShieldCheck, Truck, CreditCard, ChevronRight, AlertTriangle, Flame, Lock } from 'lucide-react'
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
    NEW: { label: 'Nuevo Sellado', class: 'bg-green-100 text-green-700' },
    LIKE_NEW: { label: 'Open Box', class: 'bg-teal-100 text-teal-700' },
    USED: { label: 'Usado', class: 'bg-orange-100 text-orange-700' },
    REFURBISHED: { label: 'Reacondicionado', class: 'bg-purple-100 text-purple-700' }
  };
  // @ts-ignore
  const conditionInfo = conditionLabels[product.condition] || conditionLabels.NEW;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const savingsAmount = hasDiscount ? (product.originalPrice! - product.price) : 0
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const isLowStock = product.stock > 0 && product.stock <= 3;

  const fixedSpecs = [
      { label: 'Procesador', value: product.cpu },
      { label: 'Memoria RAM', value: product.ram },
      { label: 'Almacenamiento', value: product.storage },
      { label: 'Pantalla', value: product.display },
      { label: 'Gráficos (Video)', value: product.gpu },
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
      <div className="w-full max-w-[100vw] overflow-x-hidden bg-white">
        
        {/* MIGA DE PAN */}
        <div className="bg-gray-50 border-b border-gray-100">
            <div className="container mx-auto px-4 py-3">
                <nav className="flex items-center text-xs font-medium text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3 mx-2 flex-shrink-0" />
                    <Link href={`/?category=${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
                    <ChevronRight className="w-3 h-3 mx-2 flex-shrink-0" />
                    <span className="text-gray-800 font-bold truncate max-w-[200px] md:max-w-none">{product.name}</span>
                </nav>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-10 pb-28 md:pb-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
            <div className="flex flex-col gap-6 md:gap-8 min-w-0">
              <div className="md:sticky md:top-24 z-10 w-full">
                  <ProductGallery images={product.images.length > 0 ? product.images : (product.image ? [product.image] : [])} productName={product.name} />
                  
                  {/* CAJA DE CONFIANZA IZQUIERDA (Info General) */}
                  <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 md:p-6 border border-blue-100 hidden md:block">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> Beneficios Exclusivos</h4>
                      <div className="space-y-4">
                          <div className="flex items-start gap-3"><div className="p-2 bg-white rounded-full shadow-sm text-blue-600"><Truck className="w-4 h-4" /></div><div><p className="text-sm font-bold text-gray-800">Envío Gratis en Lima</p><p className="text-xs text-gray-500">Recibe tu pedido en 24-48 horas hábiles.</p></div></div>
                          <div className="flex items-start gap-3"><div className="p-2 bg-white rounded-full shadow-sm text-blue-600"><CreditCard className="w-4 h-4" /></div><div><p className="text-sm font-bold text-gray-800">Pago Seguro</p><p className="text-xs text-gray-500">Aceptamos transferencias, Yape y tarjetas.</p></div></div>
                      </div>
                  </div>
              </div>
            </div>

            {/* --- COLUMNA DERECHA: INFO Y COMPRA --- */}
            <div className="flex flex-col w-full min-w-0">
              
              {/* ETIQUETAS DE CABECERA */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4 w-full">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>

                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${conditionInfo.class}`}>
                  {conditionInfo.label}
                </span>
                
                {product.warrantyMonths && product.warrantyMonths > 0 ? (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    GARANTÍA DE {product.warrantyMonths} MESES
                  </span>
                ) : null}

                {hasDiscount && <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse uppercase tracking-wide">¡Oferta -{discountPercentage}%!</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight break-words">{product.name}</h1>
              <p className="text-base md:text-lg text-gray-500 mb-6 font-medium break-words">{product.brand} {product.model}</p>

              {/* CAJA DE PRECIO Y STOCK */}
              <div className="mb-6 w-full p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Precio Online</p>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 leading-none">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && <span className="text-xs sm:text-sm text-gray-400 line-through decoration-red-400 decoration-2">{formatPrice(product.originalPrice)}</span>}
                    </div>
                    {hasDiscount && <div className="mt-1.5"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold border border-red-200 inline-flex items-center gap-1 whitespace-nowrap">🔥 ¡Ahorras {formatPrice(savingsAmount)}!</span></div>}
                </div>
                
                {product.stock > 0 ? (
                    <div className="flex flex-col items-end flex-shrink-0">
                        {isLowStock ? (
                            <><span className="inline-flex items-center gap-1 bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold mb-1 whitespace-nowrap animate-pulse shadow-sm shadow-red-200"><Flame className="w-3 h-3" /> ¡Últimas unidades!</span><p className="text-[10px] md:text-xs text-red-600 font-extrabold whitespace-nowrap">Solo quedan {product.stock}</p></>
                        ) : (
                            <><span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold mb-1 whitespace-nowrap"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>En Stock</span><p className="text-[10px] md:text-xs text-gray-400 font-medium whitespace-nowrap">{product.stock} disp.</p></>
                        )}
                    </div>
                ) : <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">Agotado</span>}
              </div>

              {product.conditionDetails && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start w-full">
                      <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span><div className="flex-1 min-w-0"><h3 className="text-xs font-bold text-amber-900 uppercase">Nota sobre el estado</h3><p className="text-sm text-amber-800 mt-1 leading-snug break-words">{product.conditionDetails}</p></div>
                  </div>
              )}

              {/* ✅ UX IX MASTERCLASS: SECCIÓN DE CONFIANZA REDISEÑADA (Verde Esmeralda) */}
              <div className="w-full mb-8">
                
                {/* 1. Banner de Garantía (Color Verde Seguro - Ahora visible en Móvil y PC) */}
                {product.warrantyMonths && product.warrantyMonths > 0 ? (
                  <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 md:p-4 flex items-center justify-between shadow-sm transition-all hover:bg-emerald-100/50">
                    <div className="flex items-center gap-3 w-full">
                      <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-emerald-900 text-sm md:text-base leading-tight truncate">Garantía Real de {product.warrantyMonths} Meses</h4>
                        <p className="text-xs md:text-sm text-emerald-700 font-medium truncate">Compra protegida contra fallas de fábrica.</p>
                      </div>
                    </div>
                    {/* Check solo visible en pantallas un poco más grandes para ahorrar espacio en móvil */}
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 hidden sm:block flex-shrink-0" />
                  </div>
                ) : null}

                {/* 2. Botón de Comprar (Solo Desktop, el móvil tiene su barra flotante) */}
                <div className="hidden md:block">
                  {product.stock > 0 && <AddToCartButton product={product} />}
                </div>

                {/* 3. Micro-texto de Seguridad Estilo Amazon (Responsive adaptado) */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-6 border-b border-gray-100 pb-8 px-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pago Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Respaldo Real</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Envíos Seguros</span>
                  </div>
                </div>

              </div>

              {/* TABLA INTELIGENTE */}
              {fixedSpecs.length > 0 && (
                <div className="mb-8 w-full max-w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Cpu className="w-5 h-5 text-blue-600" /> Componentes Principales
                    </h3>
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

              {/* DESCRIPCIÓN */}
              {product.description && (
                <div className="mb-8 w-full max-w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                    <div className="prose prose-blue prose-sm text-gray-600 max-w-full bg-gray-50/50 p-4 md:p-5 rounded-xl border border-gray-100 overflow-x-auto break-words [&>img]:max-w-full [&>table]:w-full">
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                </div>
              )}

              {/* SPECS ADICIONALES */}
              {filteredDynamicSpecs.length > 0 && (
                  <div className="mt-4 pt-6 border-t border-gray-100 w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PackagePlus className="w-5 h-5 text-gray-400" /> Más Detalles
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

      {/* BARRA FLOTANTE MÓVIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between">
          <div className="flex flex-col justify-center min-w-0 mr-2">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-none mb-1">Precio total</p>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700 leading-none truncate">{formatPrice(product.price)}</span>
          </div>
          <div className="w-[160px] sm:w-[200px] flex-shrink-0">
              {product.stock > 0 ? <AddToCartButton product={product} /> : <span className="block w-full text-center bg-gray-200 text-gray-500 py-3 rounded-xl font-bold text-sm">Agotado</span>}
          </div>
      </div>
    </>
  )
}