"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { formatPrice } from '@/lib/utils'
import {
  Wrench, Search, MonitorSmartphone, RefreshCw, X,
  Edit, Trash2, ChevronDown, CalendarDays, Filter, CreditCard
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_OPTIONS = [
  { value: 'PENDING',     label: 'Pendiente',  emoji: '🟠' },
  { value: 'IN_PROGRESS', label: 'En Proceso', emoji: '🔵' },
  { value: 'COMPLETED',   label: 'Terminado',  emoji: '🟢' },
  { value: 'DELIVERED',   label: 'Entregado',  emoji: '⚫' },
  { value: 'CANCELLED',   label: 'Cancelado',  emoji: '🔴' },
]

const PAYMENT_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente', emoji: '⏳', cls: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300' },
  { value: 'PARTIAL',  label: 'Abono',     emoji: '💵', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { value: 'PAID',     label: 'Pagado',    emoji: '✅', cls: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
]

const paymentActiveCls: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border-gray-300',
  PARTIAL:  'bg-blue-100 text-blue-700 border-blue-300',
  PAID:     'bg-green-100 text-green-700 border-green-300',
}

const statusClass = (s: string) => ({
  PENDING:     'bg-orange-50 text-orange-700 border-orange-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED:   'bg-green-50 text-green-700 border-green-200',
  DELIVERED:   'bg-gray-100 text-gray-700 border-gray-200',
  CANCELLED:   'bg-red-50 text-red-700 border-red-200',
} as Record<string,string>)[s] || 'bg-gray-100 text-gray-600'

const statusLabel = (s: string) => ({
  PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso', COMPLETED: 'Terminado',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
} as Record<string,string>)[s] || s

export default function ServicesListClient({ initialTickets, initialStats, statusFilter }: any) {
  const [search,       setSearch]       = useState('')
  const [techFilter,   setTechFilter]   = useState('')
  const [payFilter,    setPayFilter]    = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingId,   setUpdatingId]   = useState<string | null>(null)
  const [payUpdatingId,setPayUpdatingId]= useState<string | null>(null)
  const [deleteId,     setDeleteId]     = useState<string | null>(null)
  const [deleteNum,    setDeleteNum]    = useState<number | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const { data: ticketsData, mutate, isValidating } = useSWR(
    `/api/servicios${statusFilter ? `?status=${statusFilter}` : ''}`,
    fetcher,
    { fallbackData: initialTickets, refreshInterval: 15000, revalidateOnFocus: true }
  )
  const tickets: any[] = ticketsData || []

  const { data: allTickets } = useSWR('/api/servicios', fetcher, {
    fallbackData: !statusFilter ? initialTickets : null,
    refreshInterval: 15000
  })

  const stats = allTickets ? {
    total:      allTickets.length,
    pending:    allTickets.filter((t: any) => t.status === 'PENDING').length,
    inProgress: allTickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
    completed:  allTickets.filter((t: any) => t.status === 'COMPLETED').length,
    delivered:  allTickets.filter((t: any) => t.status === 'DELIVERED').length,
  } : (initialStats ?? { total: 0, pending: 0, inProgress: 0, completed: 0, delivered: 0 })

  const technicians = useMemo(() => {
    const seen = new Map<string, string>()
    tickets.forEach((t: any) => { if (t.technician) seen.set(t.technician.id, t.technician.name) })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [tickets])

  const filteredTickets = useMemo(() => {
    const q    = search.toLowerCase()
    const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null
    const to   = dateTo   ? new Date(dateTo   + 'T23:59:59') : null
    return tickets.filter((t: any) => {
      if (q && !(
        t.number.toString().includes(q) ||
        t.client?.name?.toLowerCase().includes(q) ||
        t.client?.phone?.includes(q) ||
        t.deviceBrand?.toLowerCase().includes(q) ||
        t.deviceModel?.toLowerCase().includes(q) ||
        t.issueReported?.toLowerCase().includes(q) ||
        t.technician?.name?.toLowerCase().includes(q)
      )) return false
      if (techFilter && t.technician?.id !== techFilter &&
          !(techFilter === 'UNASSIGNED' && !t.technician)) return false
      if (payFilter && t.paymentStatus !== payFilter) return false
      const created = new Date(t.createdAt)
      if (from && created < from) return false
      if (to   && created > to  ) return false
      return true
    })
  }, [tickets, search, techFilter, payFilter, dateFrom, dateTo])

  const activeFilterCount = [techFilter, payFilter, dateFrom, dateTo].filter(Boolean).length
  const clearAdvanced = () => { setTechFilter(''); setPayFilter(''); setDateFrom(''); setDateTo('') }

  const handleManualRefresh = async () => {
    setIsRefreshing(true); await mutate(); setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleQuickStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId)
    try {
      const res = await fetch(`/api/servicios/${ticketId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`Estado: ${statusLabel(newStatus)}`)
      mutate()
    } catch { toast.error("Error al actualizar estado") }
    finally { setUpdatingId(null) }
  }

  const handleQuickPayment = async (ticketId: string, newPay: string) => {
    setPayUpdatingId(ticketId)
    try {
      const res = await fetch(`/api/servicios/${ticketId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPay })
      })
      if (!res.ok) throw new Error()
      const lbl = PAYMENT_OPTIONS.find(p => p.value === newPay)?.label || newPay
      toast.success(`Pago: ${lbl}`)
      mutate()
    } catch { toast.error("Error al actualizar pago") }
    finally { setPayUpdatingId(null) }
  }

  const handleQuickPaymentPillAmount = async (ticketId: string, amount: number) => {
    setPayUpdatingId(ticketId)
    try {
      const res = await fetch(`/api/servicios/${ticketId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount: amount })
      })
      if (!res.ok) throw new Error()
      toast.success(`Abono actualizado: ${formatPrice(amount)}`)
      mutate()
    } catch { toast.error("Error al actualizar abono") }
    finally { setPayUpdatingId(null) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/servicios/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Ticket eliminado'); setDeleteId(null); mutate()
    } catch { toast.error('Error al eliminar') }
    finally { setDeleting(false) }
  }

  const getCountForFilter = (value: string) => {
    if (!value) return stats.total
    if (value === 'PENDING')     return stats.pending
    if (value === 'IN_PROGRESS') return stats.inProgress
    if (value === 'COMPLETED')   return stats.completed
    if (value === 'DELIVERED')   return stats.delivered ?? 0
    return 0
  }

  return (
    <>
      {/* ── Delete Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">¿Eliminar ST-{deleteNum?.toString().padStart(4, '0')}?</h3>
                <p className="text-gray-500 text-sm mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 justify-end bg-gray-50">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 text-sm">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 text-sm flex items-center gap-1.5 disabled:opacity-50">
                <Trash2 className="w-4 h-4" /> {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Main Content ── */}
      <div className="min-h-screen bg-gray-50/50 bg-admin-dots -mt-8 pt-8">
        <div className="container-admin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-9">
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { href: '/admin/servicios',                    label: 'Total',      count: stats.total,          active: !statusFilter,                 bg: 'bg-white',      text: 'text-gray-900', border: 'border-gray-200'  },
          { href: '/admin/servicios?status=PENDING',     label: 'Pendientes', count: stats.pending,        active: statusFilter === 'PENDING',     bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-100' },
          { href: '/admin/servicios?status=IN_PROGRESS', label: 'En Proceso', count: stats.inProgress,     active: statusFilter === 'IN_PROGRESS', bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-100'   },
          { href: '/admin/servicios?status=COMPLETED',   label: 'Terminados', count: stats.completed,      active: statusFilter === 'COMPLETED',   bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-100'  },
          { href: '/admin/servicios?status=DELIVERED',   label: 'Entregados', count: stats.delivered ?? 0, active: statusFilter === 'DELIVERED',   bg: 'bg-gray-50',    text: 'text-gray-700',   border: 'border-gray-200'   },
        ].map(card => (
          <Link key={card.href} href={card.href}
            className={`${card.bg} p-4 rounded-xl border transition-all hover:shadow-sm ${card.active ? `${card.border} ring-2 ring-offset-1 shadow-sm` : card.border + ' hover:border-gray-300'}`}>
            <p className={`text-xs font-semibold ${card.text} opacity-70 mb-1`}>{card.label}</p>
            <p className={`text-2xl font-black ${card.text}`}>{card.count}</p>
          </Link>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Status pill tabs */}
        <div className="flex gap-2 overflow-x-auto p-4 pb-0 border-b border-gray-100">
          {[
            { label: 'Todos',         value: '',            color: 'gray'   },
            { label: '🟠 Pendientes', value: 'PENDING',     color: 'orange' },
            { label: '🔵 En Proceso', value: 'IN_PROGRESS', color: 'blue'   },
            { label: '🟢 Terminados', value: 'COMPLETED',   color: 'green'  },
            { label: '⚫ Entregados', value: 'DELIVERED',   color: 'gray'   },
          ].map(f => (
            <Link key={f.value}
              href={f.value ? `/admin/servicios?status=${f.value}` : '/admin/servicios'}
              className={`whitespace-nowrap mb-3 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
                ${(statusFilter === f.value) || (!statusFilter && !f.value)
                  ? f.color === 'orange' ? 'bg-orange-500 text-white border-orange-500'
                    : f.color === 'blue'  ? 'bg-blue-500 text-white border-blue-500'
                    : f.color === 'green' ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {f.label} ({getCountForFilter(f.value)})
            </Link>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="N°, cliente, equipo, técnico, falla..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none bg-gray-50 focus:bg-white transition-colors" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-colors
                ${showAdvanced || activeFilterCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Filter className="w-3.5 h-3.5" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">{activeFilterCount}</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearAdvanced} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
            <button onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors ml-auto">
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing || isValidating ? 'animate-spin' : ''}`} />
              {isRefreshing || isValidating ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {showAdvanced && (
            <div className="flex flex-wrap gap-3 pt-1 pb-0.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Técnico:</label>
                <select value={techFilter} onChange={e => setTechFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white cursor-pointer">
                  <option value="">Todos</option>
                  <option value="UNASSIGNED">Sin asignar</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Pago:</label>
                <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white cursor-pointer">
                  <option value="">Todos</option>
                  <option value="PENDING">⏳ Pendiente</option>
                  <option value="PARTIAL">💵 Abono</option>
                  <option value="PAID">✅ Pagado</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500">Desde:</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white cursor-pointer" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Hasta:</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white cursor-pointer" />
              </div>
            </div>
          )}
        </div>

        {/* Column header */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Ticket / Cliente</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo / Falla</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-52">
                  <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Pago</span>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Técnico</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredTickets.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-blue-50/20 transition-colors group">

                  {/* Ticket + Client */}
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/servicios/${ticket.id}`} className="block">
                      <span className="text-sm font-extrabold text-blue-600 group-hover:text-blue-800 tracking-tight">
                        ST-{ticket.number.toString().padStart(4, '0')}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-tight truncate max-w-[160px]">
                        {ticket.client?.name || <span className="italic text-gray-400">Sin cliente</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Link>
                  </td>

                  {/* Device + issue */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500 flex-shrink-0 mt-0.5">
                        <MonitorSmartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {[ticket.deviceBrand, ticket.deviceModel].filter(Boolean).join(' ') || <span className="italic text-gray-400 font-normal">Sin especificar</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-[220px] truncate leading-snug" title={ticket.issueReported}>
                          {ticket.issueReported || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Quick Service Status */}
                  <td className="px-5 py-3.5">
                    <select
                      value={ticket.status}
                      onChange={e => handleQuickStatus(ticket.id, e.target.value)}
                      disabled={updatingId === ticket.id}
                      className={`text-xs font-bold rounded-lg border px-2 py-1.5 outline-none cursor-pointer transition-all w-full ${statusClass(ticket.status)} disabled:opacity-50`}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
                    </select>
                  </td>

                  {/* Quick Payment Status — select dropdown & inline amount */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={ticket.paymentStatus}
                        onChange={e => handleQuickPayment(ticket.id, e.target.value)}
                        disabled={payUpdatingId === ticket.id}
                        className={`text-xs font-bold rounded-lg border px-2 py-1.5 outline-none cursor-pointer transition-all w-full min-w-[110px] disabled:opacity-50
                          ${ticket.paymentStatus === 'PAID'    ? 'bg-green-50 text-green-700 border-green-300'
                          : ticket.paymentStatus === 'PARTIAL' ? 'bg-blue-50 text-blue-700 border-blue-300'
                          :                                      'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <option value="PENDING">⏳ Pendiente</option>
                        <option value="PARTIAL">💵 Abono</option>
                        <option value="PAID">✅ Pagado</option>
                      </select>
                      
                      {ticket.paymentStatus === 'PARTIAL' ? (
                        <div className="flex flex-col gap-1 mt-0.5">
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[10px] font-semibold text-gray-400">Tot:</span>
                            <span className="text-[11px] font-bold text-gray-600">{formatPrice(ticket.totalAmount)}</span>
                          </div>
                          <div className="flex items-center gap-1 relative">
                            <span className="absolute left-1.5 text-[10px] font-bold text-blue-500">S/</span>
                            <input 
                              type="number" step="0.01"
                              defaultValue={ticket.paidAmount || ''}
                              placeholder="Abono"
                              className="w-full bg-blue-50/50 border border-blue-200 rounded text-[11px] pl-4 pr-1 py-1 px-1 text-blue-800 font-bold outline-none focus:border-blue-400 focus:bg-white transition-all text-right shadow-inner"
                              onBlur={e => {
                                const v = Number(e.target.value)
                                if (v !== ticket.paidAmount) handleQuickPaymentPillAmount(ticket.id, v)
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') e.currentTarget.blur()
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-0.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-gray-400">Total:</span>
                          <span className="text-[11px] font-bold text-gray-600">{formatPrice(ticket.totalAmount)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Technician */}
                  <td className="px-5 py-3.5">
                    {ticket.technician ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-black text-[10px] uppercase flex-shrink-0 shadow-sm">
                          {ticket.technician.name.substring(0, 2)}
                        </div>
                        <span className="text-xs text-gray-700 font-medium leading-tight max-w-[80px] truncate">{ticket.technician.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin asignar</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/servicios/${ticket.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => { setDeleteId(ticket.id); setDeleteNum(ticket.number) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link href={`/admin/servicios/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-bold">
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Wrench className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                    <p className="text-base font-semibold text-gray-800 mb-1">Sin resultados</p>
                    <p className="text-sm text-gray-400">Ajusta los filtros para encontrar tickets.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            {filteredTickets.length} resultado{filteredTickets.length !== 1 ? 's' : ''}
            {search && ` para "${search}"`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''} activo${activeFilterCount > 1 ? 's' : ''}`}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearAdvanced} className="text-xs text-blue-600 font-semibold hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
            </div>

            <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Acciones rápidas</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/admin/servicios/nuevo"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors text-center"
                  >
                    + Nuevo ticket
                  </Link>
                  <button
                    onClick={handleManualRefresh}
                    className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 text-blue-500 ${isRefreshing || isValidating ? 'animate-spin' : ''}`} />
                    {isRefreshing || isValidating ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Resumen</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-[11px] text-gray-500 font-bold uppercase">Mostrando</p>
                    <p className="text-xl font-black text-gray-900">{filteredTickets.length}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-[11px] text-gray-500 font-bold uppercase">Total</p>
                    <p className="text-xl font-black text-gray-900">{stats.total}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">🟠 Pendientes</span>
                    <span className="font-bold text-gray-800">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">🔵 En proceso</span>
                    <span className="font-bold text-gray-800">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">🟢 Terminados</span>
                    <span className="font-bold text-gray-800">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">⚫ Entregados</span>
                    <span className="font-bold text-gray-800">{stats.delivered ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Filtros</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAdvanced} className="text-xs text-blue-600 font-bold hover:underline">
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Búsqueda</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">{search || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Técnico</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">{techFilter || 'Todos'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Pago</span>
                    <span className="font-semibold text-gray-800">{payFilter || 'Todos'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Desde</span>
                    <span className="font-semibold text-gray-800">{dateFrom || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Hasta</span>
                    <span className="font-semibold text-gray-800">{dateTo || '—'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className={`mt-3 w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors
                    ${showAdvanced ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {showAdvanced ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
