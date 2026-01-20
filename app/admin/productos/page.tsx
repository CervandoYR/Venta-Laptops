import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
// 1. Importamos el nuevo botón
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc', // Ordenamos por el más reciente
    },
  })

  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tienes productos registrados aún.</p>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            Crear Primer Producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-4 font-semibold text-gray-600">Marca</th>
                <th className="text-left p-4 font-semibold text-gray-600">Precio</th>
                <th className="text-left p-4 font-semibold text-gray-600">Stock</th>
                <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="p-4 text-gray-600">{product.brand}</td>
                  <td className="p-4 font-medium text-green-600">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4">
                    {product.stock > 0 ? (
                        <span className="text-gray-900">{product.stock} und.</span>
                    ) : (
                        <span className="text-red-500 font-bold">Agotado</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    {/* 2. Aquí usamos el botón de eliminar pasándole el ID */}
                    <DeleteProductButton id={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}