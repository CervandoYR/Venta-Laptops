import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Preparar datos numéricos
    const price = parseFloat(body.price)
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    const stock = parseInt(body.stock)

    // Actualizar
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        price,
        originalPrice,
        stock,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error actualizando producto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE también debería estar aquí (puedes dejar el que tenías)
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Producto eliminado' })
}