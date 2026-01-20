import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { items, shipping, total } = body

    // Verificar que el carrito tenga items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    // Crear Stripe Checkout Session
    const session_url = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.product.name,
            description: `${item.product.brand} - ${item.product.model}`,
            images: item.product.image ? [session_url + item.product.image] : [],
          },
          unit_amount: Math.round(item.product.price * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${session_url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${session_url}/checkout?canceled=true`,
      customer_email: shipping.shippingEmail,
      metadata: {
        userId: session.user.id,
        shippingName: shipping.shippingName,
        shippingEmail: shipping.shippingEmail,
        shippingAddress: shipping.shippingAddress,
        shippingCity: shipping.shippingCity,
        shippingPostalCode: shipping.shippingPostalCode,
        shippingCountry: shipping.shippingCountry,
      },
    })

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}
