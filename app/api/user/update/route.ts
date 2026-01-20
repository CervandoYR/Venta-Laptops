import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { name, password, address, phone } = body

    // Validaciones de Seguridad (Backend)
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    
    if (!nameRegex.test(name)) {
      return NextResponse.json(
        { error: 'El nombre solo puede contener letras y espacios' }, 
        { status: 400 }
      )
    }

    const updateData: any = { 
      name,
      address,
      phone
    }

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' }, 
          { status: 400 }
        )
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      updateData.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error al actualizar:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}