import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Validación de Nombre (No números)
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!nameRegex.test(name)) {
      return NextResponse.json(
        { error: 'El nombre no puede contener números ni símbolos.' }, 
        { status: 400 }
      )
    }

    // Validación Contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' }, 
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    // Encriptar y Crear
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email 
    })

  } catch (error) {
    console.error('Error registro:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' }, 
      { status: 500 }
    )
  }
}