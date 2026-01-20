import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        ...body,
        images: body.images || [],
      },
    })

    revalidatePath('/admin/productos')
    revalidatePath('/') 

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear el producto' },
      { status: 500 }
    )
  }
}