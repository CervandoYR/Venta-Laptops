import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const category = searchParams.get('category')
  const min = searchParams.get('min')
  const max = searchParams.get('max')

  try {
    const where: Prisma.ProductWhereInput = {
      active: true, // Solo productos activos
    }

    // 1. FILTRO DE CATEGORÍA (PRIORIDAD MÁXIMA)
    // Esto asegura que si Kiro pide "Laptops", SOLO salgan Laptops.
    if (category && category !== 'Todos') {
      where.category = { 
        equals: category, 
        mode: 'insensitive' 
      }
    }

    // 2. FILTRO DE TEXTO
    if (q && q.length > 0) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    // 3. RANGO DE PRECIOS
    if (min || max) {
      where.price = {}
      if (min) where.price.gte = parseFloat(min)
      if (max) where.price.lte = parseFloat(max)
    }

    // BÚSQUEDA
    const products = await prisma.product.findMany({
      where,
      take: 8, // Traemos 8 para tener opciones
      orderBy: { price: 'asc' }, // Ordenar por precio ascendente (lo más barato primero)
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
    console.error('Error en búsqueda API:', error)
    return NextResponse.json([], { status: 500 })
  }
}