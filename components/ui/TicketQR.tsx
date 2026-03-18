"use client"
import { QRCodeSVG } from 'qrcode.react'

export default function TicketQR({ ticketId, baseUrl }: { ticketId: string; baseUrl: string }) {
  const url = `${baseUrl}/seguimiento/${ticketId}`
  return <QRCodeSVG value={url} size={90} level="M" />
}
