import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'
import Image from 'next/image'
import ImageCarousel from '@/components/ui/ImageCarousel'
import SearchBar from '@/components/ui/SearchBar'
import ProductFilters from '@/components/products/ProductFilters'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Iconos para categorías (puedes cambiarlos por imágenes)
const CATEGORY_ICONS: Record<string, string> = {
  'Laptops': '💻',
  'PC Escritorio': '🖥️',
  'Monitores': '📺',
  'Periféricos': '🖱️',
  'Componentes': '💾',
  'Audio': '🎧',
  'Todos': '🔥'
}

interface PageProps {
  searchParams: {
    q?: string
    category?: string
    min?: string
    max?: string
    brand?: string
    condition?: string
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  
  // 1. Cargar Configuración del Hero
  let config = await prisma.storeConfig.findFirst()
  if (!config) {
    config = {
      heroTitle: "Laptops Premium para Profesionales",
      heroText: "Encuentra la laptop perfecta...",
      heroImage: "",
      carouselImages: []
    } as any
  }

  // 2. Construir el Filtro Dinámico (WHERE)
  const { q, category, min, max, brand, condition } = searchParams

  const where: Prisma.ProductWhereInput = {
    active: true,
    // Filtro por Categoría
    ...(category && category !== 'Todos' ? { category } : {}),
    // Búsqueda por texto (Nombre o Descripción)
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ]
    } : {}),
    // Filtro de Precio
    price: {
      gte: min ? parseFloat(min) : undefined,
      lte: max ? parseFloat(max) : undefined,
    },
    // Filtro de Marca
    ...(brand && brand !== 'all' ? { brand: { equals: brand, mode: 'insensitive' } } : {}),
    // Filtro de Condición
    ...(condition && condition !== 'all' ? { condition: condition as any } : {}),
  }

  // 3. Consultas a la Base de Datos
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Obtener lista de marcas única para el filtro (solo de productos activos)
  const brandsGroup = await prisma.product.groupBy({
    by: ['brand'],
    where: { active: true },
    _count: { brand: true }
  })
  const availableBrands = brandsGroup.map(b => b.brand)

  return (
    <main className="bg-gray-50 min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            {config.heroImage && <Image src={config.heroImage} alt="Background" fill className="object-cover" />}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 animate-fade-in-up">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
                {config.heroTitle}
              </h1>
              <p className="text-lg text-blue-100 max-w-lg">
                {config.heroText}
              </p>
              <div className="pt-2">
                <SearchBar />
              </div>
            </div>
            {/* Carrusel (Solo visible en tablet/desktop para ahorrar espacio en móvil) */}
            <div className="hidden md:block relative w-full h-[350px] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
               <ImageCarousel images={config.carouselImages} />
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORÍAS MEJORADAS (Scroll Horizontal) --- */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar items-center">
            {['Todos', 'Laptops', 'PC Escritorio', 'Monitores', 'Periféricos', 'Componentes', 'Audio'].map((cat) => {
              const isActive = (category === cat) || (!category && cat === 'Todos')
              return (
                <Link 
                  key={cat}
                  href={cat === 'Todos' ? '/' : `/?category=${cat}`}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                    ${isActive 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                  `}
                >
                  <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (Filtros + Grid) --- */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Layout Grid: Filtros a la izquierda (desktop), Productos a la derecha */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR DE FILTROS (Desktop) */}
          <aside className="w-full md:w-64 flex-shrink-0">
             <ProductFilters brands={availableBrands} />
          </aside>

          {/* GRID DE PRODUCTOS */}
          <div className="flex-1">
            
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {q ? `Resultados para "${q}"` : (category ? category : 'Catálogo Completo')}
                  </h2>
                  {(min || max || brand || condition) && (
                    <p className="text-sm text-gray-500 mt-1">Filtros aplicados</p>
                  )}
               </div>
               <span className="text-sm font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
                  {products.length} productos
               </span>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center px-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-800">No encontramos resultados</h3>
                <p className="text-gray-500 max-w-sm mt-2">
                  Intenta ajustar los filtros de precio o busca con otros términos.
                </p>
                <Link href="/" className="mt-6 text-blue-600 font-bold hover:underline">
                   Limpiar todos los filtros
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
            {/* FEATURES */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 hover:bg-blue-50 rounded-xl transition-colors group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🚚</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Envío Gratis</h3>
              <p className="text-gray-600">En todo Lima para compras mayores a S/500</p>
            </div>
            <div className="text-center p-6 hover:bg-green-50 rounded-xl transition-colors group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🛡️</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Garantía Real</h3>
              <p className="text-gray-600">12 meses de garantía directa de tienda</p>
            </div>
            <div className="text-center p-6 hover:bg-purple-50 rounded-xl transition-colors group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💳</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Pago Seguro</h3>
              <p className="text-gray-600">Aceptamos todas las tarjetas y Yape/Plin</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}