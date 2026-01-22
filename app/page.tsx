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
import { ClientsCarousel } from '@/components/ui/ClientsCarousel' // Importamos el nuevo carrusel

export const dynamic = 'force-dynamic'

// Iconos para las categorías rápidas
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
  
  // 1. CARGA DE DATOS (Configuración y Destacados)
  const [config, featuredProducts] = await Promise.all([
    prisma.storeConfig.findFirst(),
    prisma.product.findMany({
      where: { featured: true, active: true },
      take: 8,
      orderBy: { updatedAt: 'desc' }
    })
  ])
  
  const siteConfig = config || {
    heroTitle: "Laptops Premium para Profesionales",
    heroText: "Encuentra la laptop perfecta para tu trabajo. Las mejores marcas, precios competitivos y envío gratis.",
    heroImage: "",
    carouselImages: []
  }

  // 2. FILTROS Y BÚSQUEDA
  const { q, category, min, max, brand, condition } = searchParams

  const searchFilter = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      { brand: { contains: q, mode: 'insensitive' as const } },
      { model: { contains: q, mode: 'insensitive' as const } },
      { category: { contains: q, mode: 'insensitive' as const } },
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

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Obtener marcas para el filtro lateral
  const brandsGroup = await prisma.product.groupBy({
    by: ['brand'],
    where: { active: true },
    _count: { brand: true }
  })
  const availableBrands = brandsGroup.map(b => b.brand)

  return (
    <main className="bg-gray-50 min-h-screen pb-0"> {/* pb-0 para que el footer pegue bien */}
      
      <FloatingWhatsApp />

      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
            {siteConfig.heroImage && <Image src={siteConfig.heroImage} alt="Background" fill className="object-cover" priority />}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Texto Hero */}
            <div className="space-y-6 text-center md:text-left animate-fade-in-up">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                🚀 Envíos a todo el Perú
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-2xl">
                {siteConfig.heroTitle}
              </h1>
              <p className="text-lg text-blue-100 max-w-lg mx-auto md:mx-0 leading-relaxed">
                {siteConfig.heroText}
              </p>
              
              <div className="pt-4 max-w-md mx-auto md:mx-0">
                <SearchBar />
              </div>
            </div>
            
            {/* Carrusel Hero */}
            <div className="relative w-full h-64 sm:h-80 md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
               <ImageCarousel images={siteConfig.carouselImages || []} />
               {/* Sombra interna para profundidad */}
               <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none"></div>
            </div>

          </div>
        </div>
      </section>

      {/* --- BARRA DE BENEFICIOS --- */}
      <div className="-mt-8 relative z-20 container mx-auto px-4">
         <BenefitsSection />
      </div>

      {/* --- FILTROS RÁPIDOS DE CATEGORÍA --- */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm mt-12">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar items-center md:justify-center">
            {['Todos', 'Laptops', 'PC Escritorio', 'Monitores', 'Periféricos', 'Componentes', 'Audio'].map((cat) => {
              const isActive = (category === cat) || (!category && cat === 'Todos')
              return (
                <Link 
                  key={cat}
                  href={cat === 'Todos' ? '/' : `/?category=${cat}`}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                    ${isActive 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                      : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100 hover:border-gray-200'}
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

      {/* --- CARRUSEL DE OFERTAS (Si no hay búsqueda activa) --- */}
      {!q && !category && featuredProducts.length > 0 && (
        <div className="py-8 bg-gradient-to-b from-white to-gray-50">
            <FeaturedCarousel title="🔥 Ofertas Relámpago" products={featuredProducts} />
        </div>
      )}

      {/* --- CATÁLOGO PRINCIPAL CON SIDEBAR --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar de Filtros (Desktop) */}
          <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
             <div className="sticky top-24 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Filtrar por</h3>
                    <ProductFilters brands={availableBrands} />
                </div>
                {/* Banner lateral opcional */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-center">
                    <p className="text-sm font-bold text-blue-800">¿Necesitas ayuda?</p>
                    <p className="text-xs text-blue-600 mt-1 mb-3">Nuestros expertos te asesoran gratis.</p>
                    <Link href="/contacto" className="block w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                        Contactar Soporte
                    </Link>
                </div>
             </div>
          </aside>

          {/* Grid de Productos */}
          <div className="flex-1">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {q ? `Resultados para "${q}"` : (category ? category : 'Explora nuestro Catálogo')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mostrando {products.length} {products.length === 1 ? 'producto' : 'productos'} disponibles
                  </p>
               </div>
               
               {/* Filtros Móviles */}
               <div className="md:hidden w-full">
                   <ProductFilters brands={availableBrands} />
               </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                    🔍
                </div>
                <h3 className="text-xl font-bold text-gray-900">No encontramos resultados</h3>
                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                  Intenta ajustar los filtros o busca con términos más generales.
                </p>
                <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
                   Ver todo el catálogo
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- NUESTRO CLIENTES (Infinite Loop) --- */}
      <ClientsCarousel />

    </main>
  )
}