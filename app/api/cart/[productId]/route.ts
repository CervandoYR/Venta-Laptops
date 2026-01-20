import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.productId,
        },
      },
    })

    return NextResponse.json({ message: 'Producto eliminado del carrito' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Error al eliminar del carrito' },
      { status: 500 }
    )
  }
}
