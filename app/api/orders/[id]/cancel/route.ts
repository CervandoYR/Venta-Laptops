import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!order) return new NextResponse('Order not found', { status: 404 })

    // Seguridad: Solo el dueño puede cancelar
    if (order.userId !== session.user.id) return new NextResponse('Forbidden', { status: 403 })
    
    // Regla de Negocio: Solo si está Pendiente
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'No se puede cancelar un pedido en proceso' }, { status: 400 })
    }

    // Actualizar estado
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}