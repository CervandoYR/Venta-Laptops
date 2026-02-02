import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // 1. Verificación de Seguridad (Solo ADMIN)
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    
    // 2. Validación de Datos Mínimos
    if (!body.name || !body.price || !body.brand) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (Nombre, Precio o Marca)' }, { status: 400 })
    }

    // 3. Conversión de Tipos (String a Number)
    const price = parseFloat(body.price)
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    const stock = parseInt(body.stock)

    // 4. GENERACIÓN DE SLUG ÚNICO (Lógica Resiliente)
    // Paso A: Definir el "Slug Base". Si el admin escribió uno, úsalo; si no, usa el nombre.
    let baseSlug = body.slug 
      ? body.slug.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') 
      : body.name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

    // Paso B: Garantizar unicidad con un contador
    let uniqueSlug = baseSlug
    let count = 1

    // Mientras exista un producto con ese slug, sigue probando (ej: laptop-hp, laptop-hp-1, laptop-hp-2...)
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count}`
      count++
    }

    // 5. Creación del Producto en Base de Datos
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: uniqueSlug, // Usamos el slug garantizado
        description: body.description,
        price,
        originalPrice,
        stock,
        image: body.image, // Imagen principal
        images: body.images, // Galería
        brand: body.brand,
        model: body.model,
        category: body.category,
        condition: body.condition,
        conditionDetails: body.conditionDetails,
        
        // Specs Técnicas
        cpu: body.cpu,
        ram: body.ram,
        storage: body.storage,
        display: body.display,
        gpu: body.gpu,
        connectivity: body.connectivity,
        ports: body.ports,
        battery: body.battery,
        dimensions: body.dimensions,
        weight: body.weight,
        sound: body.sound,
        
        // JSON Flexible para extras
        specifications: body.specifications,
        
        // Estados
        featured: body.featured,
        active: body.active,
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error creando producto:', error)
    // Devolvemos un error genérico pero registramos el detalle en consola
    return NextResponse.json({ error: 'Error interno al procesar la solicitud' }, { status: 500 })
  }
}