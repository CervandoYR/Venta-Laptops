import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'
import Image from 'next/image'
import ImageCarousel from '@/components/ui/ImageCarousel'
import SearchBar from '@/components/ui/SearchBar'
import ProductFilters from '@/components/products/ProductFilters'
import { Prisma } from '@prisma/client'
import { FeaturedCarousel } from '@/components/products/FeaturedCarousel'
import BenefitsSection from '@/components/ui/BenefitsSection'
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp'

export const dynamic = 'force-dynamic'

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
  
  // 1. Configuración y Destacados
  const [config, featuredProducts] = await Promise.all([
    prisma.storeConfig.findFirst(),
    prisma.product.findMany({
      where: { 
        featured: true, 
        active: true 
      },
      take: 8,
      orderBy: { updatedAt: 'desc' }
    })
  ])
  
  const siteConfig = config || {
    heroTitle: "Laptops Premium para Profesionales",
    heroText: "Encuentra la laptop perfecta...",
    heroImage: "",
    carouselImages: []
  }

  // 2. Construcción de Filtros Avanzada
  const { q, category, min, max, brand, condition } = searchParams

  // Lógica de búsqueda mejorada
  const searchFilter = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      { brand: { contains: q, mode: 'insensitive' as const } },
      { model: { contains: q, mode: 'insensitive' as const } },
      { category: { contains: q, mode: 'insensitive' as const } },
      { cpu: { contains: q, mode: 'insensitive' as const } },
      { gpu: { contains: q, mode: 'insensitive' as const } },
    ]
  } : {}

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category && category !== 'Todos' ? { category } : {}),
    ...searchFilter,
    price: {
      gte: min ? parseFloat(min) : undefined,
      lte: max ? parseFloat(max) : undefined,
    },
    ...(brand && brand !== 'all' ? { brand: { equals: brand, mode: 'insensitive' as const } } : {}),
    ...(condition ? { condition: condition as any } : {}),
  }

  // 3. Consulta de Productos
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Obtener marcas disponibles
  const brandsGroup = await prisma.product.groupBy({
    by: ['brand'],
    where: { active: true },
    _count: { brand: true }
  })
  const availableBrands = brandsGroup.map(b => b.brand)

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      
      <FloatingWhatsApp />

      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            {siteConfig.heroImage && <Image src={siteConfig.heroImage} alt="Background" fill className="object-cover" />}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Columna Texto */}
            <div className="space-y-4 animate-fade-in-up text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
                {siteConfig.heroTitle}
              </h1>
              <p className="text-lg text-blue-100 max-w-lg mx-auto md:mx-0">
                {siteConfig.heroText}
              </p>
              <div className="pt-2">
                <SearchBar />
              </div>
            </div>
            
            {/* Columna Carrusel (CORREGIDO: Visible en móvil) */}
            <div className="block relative w-full h-56 sm:h-72 md:h-[350px] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 mt-6 md:mt-0">
               <ImageCarousel images={siteConfig.carouselImages || []} />
            </div>

          </div>
        </div>
      </section>

      <BenefitsSection />

      {/* --- CATEGORÍAS --- */}
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

      {/* --- CARRUSEL DESTACADOS --- */}
      {!q && !category && featuredProducts.length > 0 && (
        <FeaturedCarousel title="🔥 Ofertas Destacadas" products={featuredProducts} />
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
             <div className="sticky top-24">
                <ProductFilters brands={availableBrands} />
             </div>
          </aside>

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

            <div className="md:hidden mb-6">
               <ProductFilters brands={availableBrands} />
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
                  Intenta buscar con otros términos o revisa la ortografía.
                </p>
                <Link href="/" className="mt-6 text-blue-600 font-bold hover:underline">
                   Limpiar todos los filtros
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

    </main>
  )
}