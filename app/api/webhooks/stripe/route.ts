import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Manejar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const userId = session.metadata?.userId

      if (!userId) {
        throw new Error('UserId no encontrado en metadata')
      }

      // Obtener items del carrito
      const cartItems = await prisma.cartItem.findMany({
        where: {
          userId,
        },
        include: {
          product: true,
        },
      })

      if (cartItems.length === 0) {
        throw new Error('Carrito vacío')
      }

      // Calcular total
      const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )

      // Crear orden
      const order = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          total,
          shippingName: session.metadata?.shippingName || '',
          shippingEmail: session.metadata?.shippingEmail || session.customer_email || '',
          shippingAddress: session.metadata?.shippingAddress || '',
          shippingCity: session.metadata?.shippingCity || '',
          shippingPostalCode: session.metadata?.shippingPostalCode || '',
          shippingCountry: session.metadata?.shippingCountry || '',
          stripePaymentIntentId: session.payment_intent as string,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      })

      // Vaciar carrito
      await prisma.cartItem.deleteMany({
        where: {
          userId,
        },
      })

      console.log('Order created:', order.id)
    } catch (error: any) {
      console.error('Error processing checkout.session.completed:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
