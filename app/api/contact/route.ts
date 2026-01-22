import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { name, email, phone, reason, orderId, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const reasonLabels: Record<string, string> = {
      'consulta': '🔎 Consulta de Producto',
      'pedido': '📦 Estado de Pedido',
      'garantia': '🛡️ Garantía / Soporte',
      'cotizacion': '💼 Cotización Corporativa',
      'otro': '✉️ Otro Motivo'
    }
    const subjectLabel = reasonLabels[reason] || 'Nuevo Mensaje'
    const emailSubject = `[WEB] ${subjectLabel} - ${name}`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const mailOptions = {
      from: `"Web Servitek" <${process.env.EMAIL_USER}>`, 
      to: 'yactayocervando@gmail.com',
      replyTo: email,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          
          <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Solicitud de Contacto</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              <a href="https://store.netsystems.net.pe" style="color: #bfdbfe !important; text-decoration: underline;">Desde store.netsystems.net.pe</a>
            </p>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">
            
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="background-color: #eff6ff; color: #1e40af; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; border: 1px solid #dbeafe;">
                ${subjectLabel}
              </span>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; color: #666; font-weight: bold; width: 100px;">Cliente:</td><td style="padding: 8px; color: #333;">${name}</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Email:</td><td style="padding: 8px; color: #2563eb;">${email}</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Teléfono:</td><td style="padding: 8px; color: #333;">${phone || '-'}</td></tr>
              
              ${orderId ? `
              <tr style="background-color: #fef9c3;">
                <td style="padding: 8px; color: #854d0e; font-weight: bold;">Pedido #:</td>
                <td style="padding: 8px; color: #854d0e; font-weight: bold;">${orderId}</td>
              </tr>` : ''}
              
            </table>

            <div style="margin-top: 25px;">
              <p style="font-weight: bold; color: #555; margin-bottom: 10px;">Mensaje del cliente:</p>
              <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; color: #4b5563; line-height: 1.5;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${email}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Responder al Cliente</a>
            </div>

          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            Netsystems - Sistema de Notificaciones Automáticas
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error enviando correo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}