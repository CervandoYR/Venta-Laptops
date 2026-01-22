import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Validaciones básicas
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!nameRegex.test(name)) return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Contraseña muy corta' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })

    // 1. CREAR USUARIO
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    // 2. VINCULAR PEDIDOS HUÉRFANOS
    await prisma.order.updateMany({
      where: { shippingEmail: email, userId: null },
      data: { userId: user.id }
    })

    // 3. ENVIAR CORREO DE BIENVENIDA (Validación Pasiva)
    // Esto confirma indirectamente que el correo es real y que tu sistema de envíos funciona.
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      await transporter.sendMail({
        from: `"Netsystems" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Bienvenido a Netsystems! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #1e3a8a; text-align: center;">¡Hola ${name}! 👋</h2>
            <p style="color: #555; font-size: 16px;">
              Gracias por crear tu cuenta en <strong>Netsystems</strong>. Ahora podrás realizar compras más rápido y ver tu historial de pedidos.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #4b5563; font-size: 14px;">Tu usuario es:</p>
              <p style="margin: 5px 0 0 0; color: #1e3a8a; font-weight: bold; font-size: 18px;">${email}</p>
            </div>

            <p style="text-align: center;">
              <a href="https://store.netsystems.net.pe/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Cuenta</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              Si no creaste esta cuenta, ignora este mensaje.
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Error enviando correo de bienvenida:', emailError)
      // No bloqueamos el registro si falla el correo, pero lo registramos en consola
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email })

  } catch (error) {
    console.error('Error registro:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}