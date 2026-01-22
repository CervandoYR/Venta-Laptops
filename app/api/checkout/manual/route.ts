import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { items, guestInfo } = body

    let userId = null
    
    // Datos del cliente
    let customerName = guestInfo?.name || 'Cliente Invitado'
    let customerEmail = guestInfo?.email || 'invitado@ejemplo.com'
    let customerPhone = guestInfo?.phone || '' 
    
    let cartItemsToProcess: Array<{
      productId: string
      quantity: number
      price: number
      name: string
      image: string
    }> = []

    // 1. LÓGICA DE USUARIO / INVITADO
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { cartItems: { include: { product: true } } }
      })

      if (user) {
        userId = user.id
        if (!guestInfo) {
            customerName = user.name
            customerEmail = user.email
            customerPhone = user.phone || ''
        }
        
        cartItemsToProcess = user.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
          image: item.product.image
        }))
      }
    } 
    
    // Fallback para invitados
    if (cartItemsToProcess.length === 0) {
      if (items && items.length > 0) {
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId }})
            if(product) {
                cartItemsToProcess.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                    name: product.name,
                    image: product.image
                })
            }
        }
      }
    }

    if (cartItemsToProcess.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    // 2. CALCULAR TOTAL
    let total = 0
    for (const item of cartItemsToProcess) {
       total += (item.price || 0) * item.quantity
    }

    // 3. CREAR PEDIDO
    const order = await prisma.order.create({
      data: {
        userId: userId, 
        total: total,
        status: 'PENDING',
        shippingName: customerName,
        shippingEmail: customerEmail,
        shippingPhone: customerPhone,
        shippingAddress: 'A coordinar por WhatsApp',
        shippingCity: 'Lima/Perú',
        shippingPostalCode: '00000',
        shippingCountry: 'Perú',
        items: {
          create: cartItemsToProcess.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId: userId } })
    }

    // ============================================================
    // 4. ENVÍO DE CORREO (CON DISCLAIMER AGREGADO)
    // ============================================================
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const productsHtml = cartItemsToProcess.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" width="50" style="border-radius: 5px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px;">
                    ${item.name} <br>
                    <span style="color: #888; font-size: 12px;">Cant: ${item.quantity}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
                    S/. ${(item.price * item.quantity).toFixed(2)}
                </td>
            </tr>
        `).join('')

        await transporter.sendMail({
            from: `"Pedidos Netsystems" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `✅ Pedido Recibido #${order.id.slice(-6).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    
                    <div style="background-color: #1e3a8a; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0;">¡Gracias por tu compra!</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.8;">Hemos recibido tu solicitud.</p>
                    </div>

                    <div style="padding: 20px; background-color: #f8fafc;">
                        <p style="margin: 0; color: #64748b; font-size: 13px;">PEDIDO</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">#${order.id.slice(-6).toUpperCase()}</p>
                    </div>

                    <div style="padding: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            ${productsHtml}
                        </table>
                        <div style="margin-top: 20px; text-align: right;">
                            <p style="font-size: 18px; font-weight: bold; color: #1e3a8a;">
                                Total: S/. ${total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div style="background-color: #eff6ff; padding: 20px; text-align: center; border-top: 1px solid #dbeafe;">
                        <p style="color: #1e40af; font-weight: bold; margin-bottom: 10px;">Siguiente paso:</p>
                        <p style="color: #3b82f6; font-size: 14px; margin: 0;">
                            Continúa la coordinación del pago con nuestro asesor en WhatsApp.
                        </p>
                    </div>

                    <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 11px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                        <p style="margin-bottom: 10px;">Netsystems Perú - Equipos de Alta Gama</p>
                        
                        <p style="margin: 0;">
                            Este correo fue enviado a <strong>${customerEmail}</strong> porque se realizó una solicitud de compra.
                            <br>
                            Si usted no realizó este pedido, por favor ignore este mensaje o contáctenos si tiene dudas.
                        </p>
                    </div>
                </div>
            `
        })
    } catch (emailError) {
        console.error('Error enviando correo:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.id.slice(-6).toUpperCase()
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}