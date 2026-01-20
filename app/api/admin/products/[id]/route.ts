import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache' // 👈 IMPORTANTE: Agrega esto

// DELETE: Eliminar producto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const product = await prisma.product.delete({
      where: {
        id: params.id,
      },
    })

    // 👇 ESTO OBLIGA A ACTUALIZAR LA PÁGINA
    revalidatePath('/admin/productos') 
    revalidatePath('/') // También actualiza el inicio por si el producto salía ahí
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al eliminar:', error)
    if ((error as any).code === 'P2003') {
       return NextResponse.json(
        { error: 'No se puede eliminar porque tiene pedidos asociados.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno al eliminar' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar producto
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    const dataToUpdate = {
        ...body,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: dataToUpdate,
    })

    //ESTO OBLIGA A ACTUALIZAR LA PÁGINA
    revalidatePath('/admin/productos') 
    revalidatePath(`/admin/productos/${params.id}`) 
    revalidatePath('/')

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}