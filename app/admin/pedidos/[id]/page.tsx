import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">
        Pedido #{order.id.slice(0, 8)}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Información de Envío</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nombre:</span> {order.shippingName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {order.shippingEmail}
              </p>
              <p>
                <span className="font-semibold">Dirección:</span> {order.shippingAddress}
              </p>
              <p>
                <span className="font-semibold">Ciudad:</span> {order.shippingCity}
              </p>
              <p>
                <span className="font-semibold">Código Postal:</span>{' '}
                {order.shippingPostalCode}
              </p>
              <p>
                <span className="font-semibold">País:</span> {order.shippingCountry}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Estado del Pedido</h2>
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />

            <div className="mt-6 pt-6 border-t space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Cliente:</span> {order.user.name}
              </p>
              <p>
                <span className="text-gray-600">Fecha:</span>{' '}
                {new Date(order.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {order.stripePaymentIntentId && (
                <p>
                  <span className="text-gray-600">Payment Intent:</span>{' '}
                  <span className="font-mono text-xs">
                    {order.stripePaymentIntentId.slice(0, 20)}...
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
