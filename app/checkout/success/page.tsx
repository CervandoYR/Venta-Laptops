import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pago Exitoso',
  description: 'Tu pago se ha procesado correctamente',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!searchParams.session_id) {
    redirect('/')
  }

  // Buscar la orden más reciente del usuario
  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      stripePaymentIntentId: {
        not: null,
      },
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
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Gracias por tu compra. Tu pedido ha sido procesado correctamente.
        </p>

        {order && (
          <div className="card p-6 mb-8 text-left">
            <h2 className="text-2xl font-bold mb-4">Detalles del Pedido</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Número de Pedido:</span>
                <span className="font-semibold">{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold capitalize">{order.status.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-xl">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Productos:</h3>
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.product.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link href="/pedidos" className="btn-primary">
            Ver Mis Pedidos
          </Link>
          <Link href="/productos" className="btn-outline">
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
