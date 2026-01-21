import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificamos si es ADMIN (ajusta según tu lógica de roles)
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    
    // Validación básica
    if (!body.name || !body.price || !body.brand) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Convertir datos numéricos
    const price = parseFloat(body.price)
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    const stock = parseInt(body.stock)

    // Crear slug único
    let slug = body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    const exists = await prisma.product.findUnique({ where: { slug } })
    if (exists) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`
    }

    const product = await prisma.product.create({
      data: {
        ...body,
        price,
        originalPrice, // Guardamos el precio de lista
        stock,
        slug,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}