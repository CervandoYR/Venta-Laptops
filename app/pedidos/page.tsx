import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import OrderCardActions from '@/components/orders/OrderCardActions' // 👈 Importamos el botón nuevo

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 p-10">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg mb-6">No tienes pedidos aún</p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Cabecera del Pedido */}
              <div className="bg-gray-50 p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                     <h3 className="font-bold text-lg text-gray-900">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                     </h3>
                     <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                        {new Date(order.createdAt).toLocaleDateString('es-PE')}
                     </span>
                  </div>
                  {/* Botón de Cancelar (Solo aparece si es Pendiente) */}
                  <OrderCardActions orderId={order.id} status={order.status} />
                </div>
                
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status === 'PENDING' && '⏳ Pendiente'}
                    {order.status === 'PROCESSING' && '⚙️ Procesando'}
                    {order.status === 'SHIPPED' && '🚚 En Camino'}
                    {order.status === 'DELIVERED' && '✅ Entregado'}
                    {order.status === 'CANCELLED' && '❌ Cancelado'}
                  </span>
                  <p className="text-xl font-extrabold text-blue-900">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="p-4 md:p-6">
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-500">x{item.quantity}</span>
                        <span className="text-gray-800 font-medium">{item.product.name}</span>
                      </div>
                      <span className="text-gray-600 font-bold">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}