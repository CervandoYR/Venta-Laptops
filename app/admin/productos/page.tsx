import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Edit, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import AdminPageHeader from '@/components/admin/AdminPageHeader' // 👇 Importar
import AdminSearchFilter from '@/components/admin/AdminSearchFilter'
import { Prisma } from '@prisma/client'

export default async function AdminProductsPage({ 
  searchParams 
}: { 
  searchParams: { q?: string, category?: string, stock?: string } 
}) {
  
  const where: Prisma.ProductWhereInput = {}

  if (searchParams.q) {
    where.name = { contains: searchParams.q, mode: 'insensitive' }
  }
  if (searchParams.category) {
    where.category = searchParams.category
  }
  if (searchParams.stock === 'low') {
    where.stock = { lte: 5 }
  } else if (searchParams.stock === 'out') {
    where.stock = { equals: 0 }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })

  const filterConfig = [
    {
      key: 'category',
      label: 'Categoría',
      options: [
        { label: 'Laptops', value: 'Laptops' },
        { label: 'PC Escritorio', value: 'PC Escritorio' },
        { label: 'Monitores', value: 'Monitores' },
        { label: 'Periféricos', value: 'Periféricos' },
        { label: 'Componentes', value: 'Componentes' },
        { label: 'Audio', value: 'Audio' },
      ]
    },
    {
      key: 'stock',
      label: 'Inventario',
      options: [
        { label: '⚠️ Stock Bajo (< 5)', value: 'low' },
        { label: '❌ Agotado', value: 'out' },
      ]
    }
  ]

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      
      {/* 👇 HEADER CON BOTÓN ATRÁS AL DASHBOARD */}
      <AdminPageHeader 
        title="Inventario" 
        subtitle="Gestiona tu catálogo de productos"
        backLink="/admin"
        actionLabel="Nuevo Producto"
        actionLink="/admin/productos/nuevo"
      />

      <AdminSearchFilter 
        placeholder="Buscar por nombre de producto..."
        filterOptions={filterConfig}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Producto</th>
                <th className="p-4 font-semibold text-gray-600">Categoría</th>
                <th className="p-4 font-semibold text-gray-600">Precio</th>
                <th className="p-4 font-semibold text-gray-600">Stock</th>
                <th className="p-4 font-semibold text-gray-600">Estado</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                        <Image src={product.image || '/placeholder.jpg'} alt="" fill className="object-contain p-1" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.category}</td>
                  <td className="p-4 font-medium">
                    <div className="flex flex-col">
                        <span>{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-red-500 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="p-4">
                    {product.featured && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Destacado</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/productos/${product.slug}`} 
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Ver en tienda"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/admin/productos/${product.id}`}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <p className="text-lg font-medium">No se encontraron productos.</p>
                <p className="text-sm">Intenta limpiar los filtros o buscar con otro término.</p>
            </div>
        )}
      </div>
    </div>
  )
}