import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) return NextResponse.json({ success: true }) // Seguridad: no decir si existe

    // 1. Generar Token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // 2. Guardar en BD
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    // 3. Enviar Correo
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"Seguridad Netsystems" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecer tu Contraseña 🔑',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #1e3a8a; text-align: center;">Recuperación de Cuenta</h2>
          <p style="color: #555; text-align: center;">Haz clic abajo para cambiar tu contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Cambiar mi Contraseña
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Válido por 1 hora.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error forgot password:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}