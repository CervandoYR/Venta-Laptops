import { Search } from 'lucide-react'

export default function Loading() {
  // Generamos un array de 6 elementos para simular 6 productos cargando
  const skeletonProducts = Array.from({ length: 6 })

  return (
    <main className="bg-gray-50 min-h-screen">
      
      {/* 1. SKELETON DEL HERO SECTION */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-6 w-32 bg-gray-800 rounded-full animate-pulse" />
              <div className="h-16 w-3/4 bg-gray-800 rounded-2xl animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
              <div className="h-12 w-full max-w-md bg-gray-800 rounded-2xl animate-pulse" />
            </div>
            <div className="w-full h-64 sm:h-80 md:h-[400px] bg-gray-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. SKELETON DE CATEGORÍAS */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-28 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* 3. SKELETON DEL CATÁLOGO (EL MÁS IMPORTANTE) */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Skeleton Sidebar (Filtros) */}
          <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white p-5 rounded-xl border border-gray-100 h-[600px] animate-pulse">
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-4 w-full bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </aside>

          {/* Skeleton Grilla de Productos */}
          <div className="flex-1">
            <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonProducts.map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Foto del producto en carga */}
                  <div className="h-56 bg-gray-100 animate-pulse flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-200" />
                  </div>
                  {/* Contenido en carga */}
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded-xl mt-4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}