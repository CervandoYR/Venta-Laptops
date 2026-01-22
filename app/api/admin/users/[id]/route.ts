import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ELIMINAR USUARIO
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Seguridad: Verificar que quien pide esto sea ADMIN
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // 2. Evitar auto-eliminación (No puedes borrarte a ti mismo)
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
    }

    // 3. Eliminar
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}

// EDITAR ROL (PATCH)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { role } = body // Esperamos recibir { role: 'ADMIN' } o { role: 'USER' }

    if (session.user.id === params.id) {
        return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}