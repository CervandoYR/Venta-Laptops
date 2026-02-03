import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    
    if (!body.name || !body.price || !body.brand) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const price = parseFloat(body.price)
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    const stock = parseInt(body.stock)

    // Lógica Resiliente de Slug Único
    let baseSlug = body.slug 
      ? body.slug.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') 
      : body.name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

    let uniqueSlug = baseSlug
    let count = 1

    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count}`
      count++
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: uniqueSlug,
        description: body.description,
        price,
        originalPrice,
        stock,
        // ✅ AQUÍ RECIBIMOS LA GARANTÍA
        warrantyMonths: body.warrantyMonths ? parseInt(body.warrantyMonths) : 0, 
        image: body.image, 
        images: body.images,
        brand: body.brand,
        model: body.model,
        category: body.category,
        condition: body.condition,
        conditionDetails: body.conditionDetails,
        cpu: body.cpu,
        ram: body.ram,
        storage: body.storage,
        display: body.display,
        gpu: body.gpu,
        specifications: body.specifications,
        featured: body.featured,
        active: body.active,
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json({ error: 'Error interno al procesar la solicitud' }, { status: 500 })
  }
}