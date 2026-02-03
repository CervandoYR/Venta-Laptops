import { ImageIcon } from 'lucide-react'

export default function LoadingProductDetail() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden bg-white animate-pulse">
      
      {/* 1. SKELETON DE MIGA DE PAN (BREADCRUMBS) */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 flex gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10 pb-28 md:pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* --- COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES --- */}
          <div className="flex flex-col gap-6">
            {/* Imagen Principal Skeleton */}
            <div className="aspect-square bg-gray-100 rounded-2xl border border-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-200" />
            </div>
            {/* Miniaturas Skeleton */}
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
              ))}
            </div>

            {/* Caja de Confianza Skeleton */}
            <div className="hidden md:block mt-4 bg-gray-50 rounded-2xl p-6 h-40" />
          </div>

          {/* --- COLUMNA DERECHA: INFO DEL PRODUCTO --- */}
          <div className="flex flex-col w-full">
            
            {/* Etiquetas Skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-6 w-24 bg-gray-100 rounded-full" />
            </div>

            {/* Título Skeleton */}
            <div className="h-10 w-full bg-gray-200 rounded-lg mb-3" />
            <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-6" />
            
            {/* Subtítulo (Marca/Modelo) */}
            <div className="h-5 w-1/3 bg-gray-100 rounded mb-8" />

            {/* Caja de Precio Skeleton */}
            <div className="h-28 w-full bg-gray-50 rounded-2xl border border-gray-100 mb-6 p-5 flex justify-between items-center">
              <div className="space-y-3">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-32 bg-gray-300 rounded-lg" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
            </div>

            {/* Botón Comprar PC Skeleton */}
            <div className="hidden md:block h-14 w-full bg-blue-100 rounded-xl mb-10" />

            {/* Especificaciones Skeleton */}
            <div className="mb-8">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex">
                    <div className="h-12 w-1/3 bg-gray-100 border-b border-white" />
                    <div className="h-12 w-2/3 bg-gray-50 border-b border-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* Descripción Skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>

          </div>
        </div>
      </div>

      {/* 📱 BARRA FLOTANTE MÓVIL SKELETON */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 sm:p-4 z-40 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-12 w-[160px] sm:w-[200px] bg-blue-100 rounded-xl" />
      </div>

    </div>
  )
}