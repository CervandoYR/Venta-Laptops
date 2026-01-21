import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 1. ELIMINAR PEDIDO (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // Verificación de Rol Admin
    if ((session?.user as any).role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Primero borramos los items relacionados (Foreign Key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    })

    // Luego borramos la orden
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// 2. ACTUALIZAR DATOS DE ENVÍO (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any).role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    // Extraemos solo lo que permitimos editar
    const { shippingAddress, shippingCity, shippingPostalCode } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        shippingAddress,
        shippingCity,
        shippingPostalCode
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}