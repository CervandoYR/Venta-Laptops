import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Status config for the public-facing tracking page
const STATUS_STEPS = [
  { key: 'PENDING',     label: 'Recibido',    emoji: '📥', desc: 'El equipo fue recibido en nuestro taller.' },
  { key: 'IN_PROGRESS', label: 'En Revisión', emoji: '🔧', desc: 'Nuestro técnico está trabajando en tu equipo.' },
  { key: 'COMPLETED',   label: 'Listo',       emoji: '✅', desc: '¡Tu equipo está listo para ser recogido!' },
  { key: 'DELIVERED',   label: 'Entregado',   emoji: '📦', desc: 'El equipo fue entregado. ¡Gracias por elegirnos!' },
]

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

export default async function TrackingPage({ params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      number: true,
      status: true,
      deviceType: true,
      deviceBrand: true,
      deviceModel: true,
      createdAt: true,
      client: { select: { name: true } },
      technician: { select: { name: true, phone: true } },
    },
  })

  if (!ticket) notFound()

  const stepIndex = getStepIndex(ticket.status)
  const currentStep = STATUS_STEPS[stepIndex]
  const isCancelled = ticket.status === 'CANCELLED'
  const deviceLabel = [ticket.deviceBrand, ticket.deviceModel].filter(Boolean).join(' ') || ticket.deviceType || 'Equipo'
  const ticketNum = `ST-${ticket.number.toString().padStart(4, '0')}`

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo-zona-notebook.png" alt="Zona Notebook" className="w-20 h-20 object-contain mb-3" />
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Zona Notebook</h1>
          <p className="text-sm text-gray-500 font-medium">Hardware · Software · Servicio Técnico</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          {/* Banner */}
          <div className={`px-8 py-6 text-white ${isCancelled ? 'bg-red-600' : 'bg-gray-900'}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Seguimiento de Orden</p>
            <h2 className="text-4xl font-black tracking-tight">{ticketNum}</h2>
            <p className="text-sm opacity-80 mt-1 font-medium">{deviceLabel}</p>
            {ticket.client?.name && (
              <p className="text-xs opacity-60 mt-0.5">Cliente: {ticket.client.name}</p>
            )}
          </div>

          {/* Current Status */}
          {isCancelled ? (
            <div className="px-8 py-8 text-center">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="text-xl font-black text-red-600">Servicio Cancelado</h3>
              <p className="text-gray-500 text-sm mt-2">Contáctanos para más información.</p>
            </div>
          ) : (
            <div className="px-8 py-8">
              {/* Big status icon + text */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-4xl flex-shrink-0">
                  {currentStep.emoji}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Estado actual</p>
                  <h3 className="text-2xl font-black text-gray-900">{currentStep.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{currentStep.desc}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                {/* Track line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-gray-100 rounded-full" />
                <div
                  className="absolute top-5 left-5 h-1 bg-gray-900 rounded-full transition-all duration-700"
                  style={{ width: stepIndex === 0 ? '0%' : `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= stepIndex
                    const active = i === stepIndex
                    return (
                      <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all
                          ${active ? 'border-gray-900 bg-gray-900 shadow-lg scale-110' : done ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                          {done ? <span className="text-white text-sm">{i < stepIndex ? '✓' : step.emoji}</span> : <span className="text-gray-300 text-sm">{step.emoji}</span>}
                        </div>
                        <p className={`text-xs font-bold mt-2 text-center leading-tight ${active ? 'text-gray-900' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
          <p className="font-bold mb-1">📞 ¿Alguna consulta?</p>
          <p className="mb-2">Comunícate con nosotros a través de WhatsApp y menciona tu número de orden <strong>{ticketNum}</strong>.</p>
          {ticket.technician?.phone && (
            <div className="mt-3 p-3 bg-white/60 rounded-xl border border-blue-200">
              <p className="font-semibold text-xs text-blue-600 uppercase tracking-wider mb-1">Técnico a cargo</p>
              <p className="font-bold text-gray-900">{ticket.technician.name}</p>
              <p className="text-gray-600 flex items-center gap-1 mt-0.5"><span className="text-lg">📱</span> WhatsApp: {ticket.technician.phone}</p>
            </div>
          )}
        </div>

        {/* Back to store */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">
            ← Ver catálogo
          </Link>
        </div>

      </div>
    </main>
  )
}
