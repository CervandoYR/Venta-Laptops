import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    // 1. Obtener usuario y su carrito actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cartItems: {
          include: { product: true }
        }
      }
    })

    if (!user || user.cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    // 2. Calcular total en el servidor (más seguro)
    const total = user.cartItems.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity)
    }, 0)

    // 3. Crear la Orden
    // Usamos datos genéricos para la dirección ya que se coordinará por chat
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: total,
        status: 'PENDING',
        shippingName: user.name || 'Cliente',
        shippingEmail: user.email,
        shippingAddress: 'A coordinar por WhatsApp',
        shippingCity: 'Lima/Perú',
        shippingPostalCode: '00000',
        shippingCountry: 'Perú',
        items: {
          create: user.cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    })

    // 4. Limpiar el carrito después de crear la orden
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.id.slice(-6).toUpperCase() // Enviamos un código corto para el mensaje
    })

  } catch (error) {
    console.error('Error creando orden manual:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}