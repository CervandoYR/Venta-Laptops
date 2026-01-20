import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [totalOrders, totalProducts, totalRevenue, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    }),
    prisma.order.findMany({
      take: 5,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])

  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          Nuevo Producto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-gray-600 mb-2">Total Pedidos</h3>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-gray-600 mb-2">Total Productos</h3>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-gray-600 mb-2">Ingresos Totales</h3>
          <p className="text-3xl font-bold">
            {formatPrice(totalRevenue._sum.total || 0)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/productos" className="card p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Gestionar Productos</h2>
          <p className="text-gray-600">CRUD completo de productos</p>
        </Link>
        <Link href="/admin/pedidos" className="card p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Gestionar Pedidos</h2>
          <p className="text-gray-600">Ver y actualizar pedidos</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Pedidos Recientes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No hay pedidos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Cliente</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2">{order.user.name}</td>
                    <td className="py-2">{formatPrice(order.total)}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
