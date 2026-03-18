"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Printer, Wrench, User, Monitor, AlertCircle,
  CheckCircle2, Clock, Calendar, Trash2, Save, Edit,
  ClipboardList, DollarSign, ChevronRight, Package
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import BackButton from '@/components/ui/BackButton'

const TicketQR = dynamic(() => import('@/components/ui/TicketQR'), { ssr: false })

const CONDITION_COLORS: Record<string, string> = {
  Buena: 'bg-green-50 text-green-800 border-green-300',
  Regular: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  Dañada: 'bg-red-50 text-red-800 border-red-300',
}

const CONDITION_ICONS: Record<string, string> = {
  Buena: '✅',
  Regular: '⚠️',
  Dañada: '❌',
}

export default function TicketViewClient({ ticket, technicians }: { ticket: any, technicians: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'checklist' | 'manage' | 'print'>('checklist')

  // Quick management state
  const [status, setStatus] = useState(ticket.status)
  const [technicianId, setTechnicianId] = useState(ticket.technicianId || '')
  const [paymentStatus, setPaymentStatus] = useState(ticket.paymentStatus)
  const [paidAmount, setPaidAmount] = useState(ticket.paidAmount)
  const [totalAmount, setTotalAmount] = useState(ticket.totalAmount)
  const [invoiced, setInvoiced] = useState(!!ticket.invoiced)
  const [notifiedClient, setNotifiedClient] = useState(!!ticket.notifiedClient)

  // Tracking URL
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/seguimiento/${ticket.id}`
    : `/seguimiento/${ticket.id}`
  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const assignedTechnician = technicians.find(t => t.id === technicianId) || ticket.technician

  const handleQuickUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/servicios/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, technicianId: technicianId || null, paymentStatus, paidAmount: Number(paidAmount), totalAmount: Number(totalAmount), invoiced, notifiedClient })
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success('✅ Ticket actualizado')
      router.refresh()
    } catch (e: any) {
      toast.error('❌ ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setShowDeleteModal(false)
    try {
      const res = await fetch(`/api/servicios/${ticket.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Ticket eliminado')
      router.push('/admin/servicios')
    } catch {
      toast.error('Error eliminando el ticket')
      setLoading(false)
    }
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso', COMPLETED: 'Terminado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado'
  }
  const statusColors: Record<string, string> = {
    PENDING: 'bg-orange-100 border-orange-300 text-orange-800',
    IN_PROGRESS: 'bg-blue-100 border-blue-300 text-blue-800',
    COMPLETED: 'bg-green-100 border-green-300 text-green-800',
    DELIVERED: 'bg-gray-200 border-gray-400 text-gray-800',
    CANCELLED: 'bg-red-100 border-red-300 text-red-800',
  }
  const statusBadge = (s: string) => ({
    PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    DELIVERED: 'bg-gray-100 text-gray-700 border-gray-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  }[s] || 'bg-gray-100 text-gray-600')

  const physicalCondition = (ticket.physicalCondition as Record<string, string>) || {}
  const accessories = (ticket.accessories as Record<string, boolean>) || {}
  const hasPhysicalData = Object.keys(physicalCondition).length > 0
  const hasAccessories = Object.values(accessories).some(Boolean) || ticket.deviceHasCharger

  const printCss = [
    '@media print {',
    '  @page { margin: 0; size: A4; }',
    '  html, body { margin: 0 !important; padding: 0 !important; }',
    '}',
  ].join('\n')

  return (
    <>
      {/* ===================== PDF PRINT VIEW ========================= */}
      <style>{printCss}</style>
      <div className="hidden print:block p-8 bg-white text-black font-sans w-full text-sm">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-gray-900 pb-5 mb-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src="/logo-zona-notebook.png"
              alt="Zona Notebook"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
            <div>
              <p className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">Zona Notebook</p>
              <p className="text-xs text-gray-500 font-semibold">Hardware · Software</p>
              <p className="text-xs text-gray-400 mt-0.5">Servicio Técnico Especializado</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black tracking-tight">ORDEN DE SERVICIO</h2>
            <p className="text-xl font-bold text-gray-700">ST-{ticket.number.toString().padStart(4, '0')}</p>
            <p className="text-gray-500 text-xs mt-1">{new Date(ticket.createdAt).toLocaleString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-xs uppercase text-gray-400 border-b pb-2 mb-3 tracking-wider">Datos del Cliente</h3>
            <p className="font-bold text-base">{ticket.client?.name || 'Sin registro'}</p>
            {ticket.client?.document && <p className="text-sm text-gray-600">DNI/RUC: {ticket.client.document}</p>}
            {ticket.client?.phone && <p className="text-sm text-gray-600">Tel: {ticket.client.phone}</p>}
            {ticket.client?.email && <p className="text-sm text-gray-600">Email: {ticket.client.email}</p>}
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-xs uppercase text-gray-400 border-b pb-2 mb-3 tracking-wider">Equipo Recepcionado</h3>
            <p className="font-bold text-base">{ticket.deviceBrand} {ticket.deviceModel}</p>
            <p className="text-sm text-gray-600">Tipo: {ticket.deviceType}</p>
            {ticket.deviceProcessor && <p className="text-sm text-gray-600">CPU: {ticket.deviceProcessor}</p>}
            {ticket.deviceRam && <p className="text-sm text-gray-600">RAM: {ticket.deviceRam}</p>}
            {(typeof ticket.deviceDisks === 'string' ? ticket.deviceDisks : JSON.stringify(ticket.deviceDisks)) && <p className="text-sm text-gray-600">Almac.: {typeof ticket.deviceDisks === 'string' ? ticket.deviceDisks : JSON.stringify(ticket.deviceDisks)}</p>}
          </div>
        </div>

        {assignedTechnician && (
          <div className="border border-gray-200 p-4 rounded-lg mb-5">
            <h3 className="font-bold text-xs uppercase text-gray-400 border-b pb-2 mb-3 tracking-wider">Técnico Asignado</h3>
            <p className="font-bold">{assignedTechnician.name}</p>
            {assignedTechnician.phone && <p className="text-sm text-gray-600">Tel: {assignedTechnician.phone}</p>}
          </div>
        )}

        {hasAccessories && (
          <div className="border border-gray-200 p-4 rounded-lg mb-5">
            <h3 className="font-bold text-xs uppercase text-gray-400 border-b pb-2 mb-3 tracking-wider">Accesorios Recibidos</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.deviceHasCharger && <span className="text-xs border border-gray-300 px-2 py-0.5 rounded">✓ Cargador (registrado)</span>}
              {Object.entries(accessories).filter(([_, v]) => v).map(([k]) => (
                <span key={k} className="text-xs border border-gray-300 px-2 py-0.5 rounded">✓ {k}</span>
              ))}
            </div>
          </div>
        )}

        <div className="border border-gray-200 p-4 rounded-lg mb-5 bg-gray-50">
          <h3 className="font-bold text-xs uppercase text-gray-400 border-b pb-2 mb-3 tracking-wider">Falla / Problema Reportado</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.issueReported}</p>
          {ticket.issueNotes && <><p className="text-xs font-bold text-gray-500 mt-3">Observaciones físicas:</p><p className="text-sm italic text-gray-600">{ticket.issueNotes}</p></>}
        </div>

        <div className="flex justify-between items-end border-t-2 border-gray-900 pt-6 mt-4">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-8">Firma del cliente — conformidad de entrega:</p>
            <div className="w-52 border-b border-gray-400"></div>
          </div>
          <div className="border-2 border-gray-900 p-4 rounded-lg bg-gray-50 w-64 text-right">
            <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-500">Presupuesto Estimado:</span><span className="text-sm">{formatPrice(ticket.totalAmount)}</span></div>
            <div className="flex justify-between mb-1 text-green-700"><span className="text-xs font-bold text-gray-500">Abonado:</span><span className="text-sm font-bold">-{formatPrice(ticket.paidAmount)}</span></div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-900"><span className="font-black text-sm">Saldo pendiente:</span><span className="font-black text-sm">{formatPrice(ticket.totalAmount - ticket.paidAmount)}</span></div>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] text-gray-400">* El diagnóstico técnico tiene un valor base si no se acepta la reparación. · Equipos no recogidos en 30 días quedan a disposición del establecimiento.</p>

        {/* QR + tracking link in PDF */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Consulta el estado de tu equipo:</p>
            <p className="text-xs text-blue-700 font-mono">{trackingUrl}</p>
            <p className="text-[10px] text-gray-400 mt-1">Escanea el QR con tu celular</p>
          </div>
          <TicketQR ticketId={ticket.id} baseUrl={trackingUrl.split('/seguimiento')[0]} />
        </div>
      </div>

      {/* ===================== DELETE MODAL ========================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-red-50 px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">¿Eliminar ST-{ticket.number.toString().padStart(4, '0')}?</h3>
                <p className="text-gray-600 text-sm mt-1">Esta acción es permanente y no se puede deshacer.</p>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 justify-end bg-gray-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={loading} className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== WEB VIEW ========================= */}
      <div className="min-h-screen bg-gray-50/50 bg-admin-dots">
        <div className="container-admin py-8 print:hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/admin/servicios" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Servicio Técnico</p>
              <h1 className="text-3xl font-extrabold text-gray-900">ST-{ticket.number.toString().padStart(4, '0')}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(ticket.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${statusBadge(status)}`}>{statusLabels[status]}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/servicios/${ticket.id}/editar`} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white shadow-md shadow-blue-500/20 rounded-xl hover:bg-blue-700 font-bold transition-all text-sm">
              <Edit className="w-4 h-4" /> Editar Ticket
            </Link>
            <button
              onClick={() => {
                const prev = document.title
                document.title = `ST-${ticket.number.toString().padStart(4, '0')} - Zona Notebook`
                window.print()
                setTimeout(() => { document.title = prev }, 1000)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm text-sm">
              <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors text-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Payment Summary Bar ─────────────────────────────── */}
        <div className={`flex flex-wrap items-center gap-3 mb-5 px-5 py-3.5 rounded-2xl border-2 ${
          ticket.paymentStatus === 'PAID'    ? 'bg-green-50 border-green-200'
          : ticket.paymentStatus === 'PARTIAL' ? 'bg-blue-50 border-blue-200'
          : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            ticket.paymentStatus === 'PAID'    ? 'bg-green-500 text-white border-green-500'
            : ticket.paymentStatus === 'PARTIAL' ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-gray-400 text-white border-gray-400'
          }`}>
            {ticket.paymentStatus === 'PAID' ? '✅ Pagado completo' : ticket.paymentStatus === 'PARTIAL' ? '💵 Abono parcial' : '⏳ Pago pendiente'}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-gray-600">
              Total: <strong className="text-gray-900">{formatPrice(ticket.totalAmount)}</strong>
            </span>
            {ticket.paidAmount > 0 && (
              <span className="text-green-700">
                Abonado: <strong>{formatPrice(ticket.paidAmount)}</strong>
              </span>
            )}
            {ticket.totalAmount - ticket.paidAmount > 0 && ticket.paymentStatus !== 'PAID' && (
              <span className={ticket.paymentStatus === 'PARTIAL' ? 'text-blue-700' : 'text-gray-500'}>
                Saldo: <strong>{formatPrice(ticket.totalAmount - ticket.paidAmount)}</strong>
              </span>
            )}
          </div>
        </div>
        {/* ── MAIN GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Tabs & Core Info (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── TAB BAR ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { key: 'checklist', label: 'Checklist', icon: ClipboardList },
            { key: 'manage', label: 'Estado y Pago', icon: DollarSign },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
                ${activeTab === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: CHECKLIST ─────────────────────────────────── */}
        {activeTab === 'checklist' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Device */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b"><Monitor className="w-4 h-4" /> Equipo</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Monitor className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{ticket.deviceBrand} {ticket.deviceModel}</p>
                    <p className="text-sm text-gray-500">{ticket.deviceType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  {ticket.deviceProcessor && <div><p className="text-xs text-gray-400 font-bold uppercase mb-0.5">CPU</p><p className="font-medium">{ticket.deviceProcessor}</p></div>}
                  {ticket.deviceRam && <div><p className="text-xs text-gray-400 font-bold uppercase mb-0.5">RAM</p><p className="font-medium">{ticket.deviceRam}</p></div>}
                  {ticket.deviceGpu && <div><p className="text-xs text-gray-400 font-bold uppercase mb-0.5">GPU</p><p className="font-medium">{ticket.deviceGpu}</p></div>}
                  {ticket.deviceDisks && <div><p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Disco</p><p className="font-medium">{typeof ticket.deviceDisks === 'string' ? ticket.deviceDisks : JSON.stringify(ticket.deviceDisks)}</p></div>}
                </div>
                {ticket.deviceHasCharger && <div className="mt-3 flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4" /> Cargador registrado</div>}
              </div>

              {/* Problem */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b"><AlertCircle className="w-4 h-4 text-orange-500" /> Problema Reportado</h3>
                <p className="text-xs text-gray-500 font-semibold mb-2">Reporte del cliente:</p>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mb-3">{ticket.issueReported || '—'}</div>
                {ticket.issueNotes && <>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Obs. físicas del técnico:</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-600 text-sm italic whitespace-pre-wrap leading-relaxed">{ticket.issueNotes}</div>
                </>}
              </div>
            </div>

            {/* Right col: Physical Condition + Accessories */}
            <div className="space-y-5">
              {/* Physical Checklist */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Condición Física — Inspección</h3>
                  {hasPhysicalData ? (
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">Completado</span>
                  ) : (
                    <Link href={`/admin/servicios/${ticket.id}/editar`} className="text-xs text-blue-600 font-bold hover:underline">+ Agregar</Link>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {hasPhysicalData ? (
                    [
                      { key: 'pantalla', label: 'Pantalla / Display' },
                      { key: 'teclado', label: 'Teclado' },
                      { key: 'touchpad', label: 'Touchpad / Trackpad' },
                      { key: 'carcasa', label: 'Carcasa / Chasis' },
                      { key: 'bateria', label: 'Batería' },
                      { key: 'puertos', label: 'Puertos (USB, HDMI, etc.)' },
                      { key: 'camaraWeb', label: 'Cámara Web' },
                      { key: 'altavoces', label: 'Altavoces / Sonido' },
                    ].map(item => {
                      const cond = physicalCondition[item.key]
                      return (
                        <div key={item.key} className="flex items-center justify-between px-6 py-3">
                          <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                          {cond ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${CONDITION_COLORS[cond] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {CONDITION_ICONS[cond] || '—'} {cond}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 italic">N/A</span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <ClipboardList className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400">No se ha completado el checklist físico.</p>
                      <Link href={`/admin/servicios/${ticket.id}/editar`} className="text-xs text-blue-600 font-bold hover:underline mt-2 inline-block">Ir a Editar →</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4" /> Accesorios Recibidos</h3>
                </div>
                <div className="p-5">
                  {hasAccessories ? (
                    <div className="flex flex-wrap gap-2">
                      {ticket.deviceHasCharger && <span className="px-3 py-1.5 bg-green-50 text-green-800 text-sm font-semibold rounded-full border border-green-200">✅ Cargador (registrado)</span>}
                      {Object.entries(accessories).filter(([_, v]) => v).map(([k]) => (
                        <span key={k} className="px-3 py-1.5 bg-blue-50 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">✅ {k}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">No se registraron accesorios.</p>
                  )}
                </div>
              </div>
            </div>
          {/* Tracking link card - full width below the grid */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">🔗 Link de seguimiento para el cliente</p>
              <p className="text-sm text-blue-700 font-mono break-all">{trackingUrl}</p>
              <p className="text-xs text-gray-400 mt-1">El cliente puede ver el estado de su equipo sin iniciar sesión.</p>
            </div>
            <button onClick={copyLink}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold border transition-all flex-shrink-0
                ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
              {copied ? '✅ ¡Copiado!' : '📋 Copiar link'}
            </button>
          </div>
          </>
        )}

        {/* ── TAB: ESTADO Y PAGO ──────────────────────────────── */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Estado */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><Clock className="w-5 h-5 text-blue-500" /> Estado del Servicio</h3>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { value: 'PENDING', label: '🟠 Pendiente' },
                  { value: 'IN_PROGRESS', label: '🔵 En Proceso' },
                  { value: 'COMPLETED', label: '🟢 Terminado' },
                  { value: 'DELIVERED', label: '⚫ Entregado' },
                ].map(s => (
                  <button key={s.value} onClick={() => setStatus(s.value)}
                    className={`py-3 px-3 text-sm font-bold rounded-xl border transition-all text-left ${status === s.value ? statusColors[s.value] : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <h3 className="font-bold text-gray-700 mb-2 text-sm">Técnico A Cargo</h3>
              <select value={technicianId} onChange={e => setTechnicianId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Sin asignar</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Pago */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><DollarSign className="w-5 h-5 text-green-500" /> Pagos</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Presupuesto Total</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">S/</span>
                    <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Abonado / Adelanto</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">S/</span>
                    <input type="number" step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-green-300 rounded-xl text-green-700 font-bold outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Estado del Pago</label>
                  <div className="flex gap-2">
                    {[['PENDING', 'Pendiente'], ['PARTIAL', 'Abono'], ['PAID', 'Pagado']].map(([v, l]) => (
                      <button key={v} onClick={() => setPaymentStatus(v)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all
                          ${paymentStatus === v ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Balance summary */}
                <div className="bg-gray-50 rounded-xl p-4 mt-2">
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Presupuesto</span><span className="font-bold">{formatPrice(Number(totalAmount))}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Abonado</span><span className="font-bold text-green-600">-{formatPrice(Number(paidAmount))}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-1"><span className="font-bold">Saldo pendiente</span><span className="font-black text-lg">{formatPrice(Number(totalAmount) - Number(paidAmount))}</span></div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="md:col-span-2 space-y-4">
              {/* Facturado / Notificado toggles */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setInvoiced(v => !v)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-2 justify-center
                    ${invoiced ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'}`}>
                  {invoiced ? '🧾 Facturado ✅' : '🧾 Marcar como Facturado'}
                </button>
                <button type="button" onClick={() => setNotifiedClient(v => !v)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-2 justify-center
                    ${notifiedClient ? 'bg-green-500 text-white border-green-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                  {notifiedClient ? '📱 Notificado WhatsApp ✅' : '📱 Notificar por WhatsApp'}
                </button>
              </div>
              <button onClick={handleQuickUpdate} disabled={loading}
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Actualizar Ticket</>}
              </button>
            </div>
          </div>
        )}
          </div>

          {/* RIGHT SIDEBAR (1/3): acciones y link */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Acciones</p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/servicios/${ticket.id}/editar`}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors text-center"
                >
                  Editar ticket
                </Link>
                <button
                  onClick={() => {
                    const prev = document.title
                    document.title = `ST-${ticket.number.toString().padStart(4, '0')} - Zona Notebook`
                    window.print()
                    setTimeout(() => { document.title = prev }, 1000)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Seguimiento</p>
              <p className="text-xs text-gray-500 mb-2">Comparte este link con el cliente:</p>
              <p className="text-sm text-blue-700 font-mono break-all">{trackingUrl}</p>
              <button
                onClick={copyLink}
                className={`mt-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold border transition-all
                  ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {copied ? '✅ ¡Copiado!' : '📋 Copiar link'}
              </button>
              <div className="mt-4 flex justify-center">
                <TicketQR ticketId={ticket.id} baseUrl={trackingUrl.split('/seguimiento')[0]} />
              </div>
            </div>
          </aside>
        </div>
        </div>
      </div>
    </>
  )
}
