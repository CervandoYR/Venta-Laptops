// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Buscamos los 5 productos más relevantes que coincidan con la búsqueda
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5, // Solo traemos 5 para que sea ultra rápido
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        brand: true,
        category: true,
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return NextResponse.json([], { status: 500 })
  }
}