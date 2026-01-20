import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// GET
export async function GET() {
  try {
    let config = await prisma.storeConfig.findFirst()
    if (!config) {
      config = await prisma.storeConfig.create({ data: {} })
    }
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const existing = await prisma.storeConfig.findFirst()

  const dataToSave = {
    heroTitle: body.heroTitle,
    heroText: body.heroText,
    heroImage: body.heroImage,
    carouselImages: body.carouselImages || [], // Guardamos el array
  }

  let config
  if (existing) {
    config = await prisma.storeConfig.update({
      where: { id: existing.id },
      data: dataToSave
    })
  } else {
    config = await prisma.storeConfig.create({
      data: dataToSave
    })
  }

  revalidatePath('/') 
  return NextResponse.json(config)
}