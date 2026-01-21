import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader' // 👇 Importar
import AdminSearchFilter from '@/components/admin/AdminSearchFilter'
import { Prisma } from '@prisma/client'

export default async function AdminOrdersPage({ 
  searchParams 
}: { 
  searchParams: { q?: string, status?: string } 
}) {
  
  const where: Prisma.OrderWhereInput = {}

  if (searchParams.status) {
    where.status = searchParams.status as any
  }

  if (searchParams.q) {
    where.OR = [
      { id: { contains: searchParams.q, mode: 'insensitive' } },
      { shippingName: { contains: searchParams.q, mode: 'insensitive' } },
      { shippingEmail: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } }
    }
  })

  const filterConfig = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Procesando', value: 'PROCESSING' },
        { label: 'En Camino', value: 'SHIPPED' },
        { label: 'Entregado', value: 'DELIVERED' },
        { label: 'Cancelado', value: 'CANCELLED' },
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'Pendiente',
      'PROCESSING': 'Procesando',
      'SHIPPED': 'En Camino',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    }
    return map[status] || status
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      
      {/* 👇 HEADER CON BOTÓN ATRÁS AL DASHBOARD */}
      <AdminPageHeader 
        title="Pedidos" 
        subtitle="Monitorea y gestiona las órdenes de compra"
        backLink="/admin"
      />

      <AdminSearchFilter 
        placeholder="Buscar por ID, Cliente o Email..."
        filterOptions={filterConfig}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Pedido</th>
                <th className="p-4 font-semibold text-gray-600">Cliente</th>
                <th className="p-4 font-semibold text-gray-600">Fecha</th>
                <th className="p-4 font-semibold text-gray-600">Estado</th>
                <th className="p-4 font-semibold text-gray-600">Total</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-mono text-sm text-gray-500">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{order.user?.name || order.shippingName}</div>
                    <div className="text-xs text-gray-500">{order.user?.email || order.shippingEmail}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/pedidos/${order.id}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      <Eye className="w-4 h-4" /> Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <p className="text-lg font-medium">No se encontraron pedidos.</p>
                <p className="text-sm">Intenta buscar con otro filtro.</p>
            </div>
        )}
      </div>
    </div>
  )
}