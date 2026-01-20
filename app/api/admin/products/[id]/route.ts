import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache' // 👈 IMPORTANTE

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        images: body.images || [],
      },
    })

    // 👇 ESTAS LÍNEAS BORRAN EL CACHÉ VIEJO
    revalidatePath('/')
    revalidatePath('/productos')
    revalidatePath(`/productos/${product.slug}`)
    revalidatePath('/admin/productos')

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    // 👇 AQUÍ TAMBIÉN
    revalidatePath('/')
    revalidatePath('/productos')
    revalidatePath('/admin/productos')

    return NextResponse.json({ message: 'Producto eliminado' })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}