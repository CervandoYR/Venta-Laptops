import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({
    items: cartItems.map((item) => ({
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
    })),
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'ProductId y quantity son requeridos' },
        { status: 400 }
      )
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      message: 'Producto agregado al carrito',
      item: cartItem,
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Error al agregar al carrito' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'ProductId y quantity son requeridos' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      })

      return NextResponse.json({ message: 'Producto eliminado del carrito' })
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      message: 'Carrito actualizado',
      item: cartItem,
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el carrito' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  await prisma.cartItem.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  return NextResponse.json({ message: 'Carrito vaciado' })
}
