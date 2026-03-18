"use client"

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { formatPrice } from '@/lib/utils'
import { Wrench, Search, MonitorSmartphone, RefreshCw, X, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente', color: 'orange' },
  { value: 'IN_PROGRESS', label: 'En Proceso', color: 'blue' },
  { value: 'COMPLETED', label: 'Terminado', color: 'green' },
  { value: 'DELIVERED', label: 'Entregado', color: 'gray' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'red' },
]

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    DELIVERED: 'bg-gray-100 text-gray-700 border-gray-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const statusLabel = (status: string) => ({
  PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso', COMPLETED: 'Terminado',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}[status] || status)

export default function ServicesListClient({ initialTickets, initialStats, statusFilter }: any) {
  const [search, setSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteNum, setDeleteNum] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data: ticketsData, mutate, isValidating } = useSWR(
    `/api/servicios${statusFilter ? `?status=${statusFilter}` : ''}`,
    fetcher,
    { fallbackData: initialTickets, refreshInterval: 15000, revalidateOnFocus: true }
  )

  const tickets = ticketsData || []

  const { data: allTickets } = useSWR('/api/servicios', fetcher, {
    fallbackData: !statusFilter ? initialTickets : null,
    refreshInterval: 15000
  })

  const stats = allTickets ? {
    total: allTickets.length,
    pending: allTickets.filter((t: any) => t.status === 'PENDING').length,
    inProgress: allTickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
    completed: allTickets.filter((t: any) => t.status === 'COMPLETED').length,
    delivered: allTickets.filter((t: any) => t.status === 'DELIVERED').length,
  } : (initialStats ?? { total: 0, pending: 0, inProgress: 0, completed: 0, delivered: 0 })

  const filteredTickets = tickets.filter((t: any) =>
    t.number.toString().includes(search) ||
    t.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.client?.phone?.toLowerCase().includes(search.toLowerCase()) ||
    t.deviceBrand?.toLowerCase().includes(search.toLowerCase()) ||
    t.deviceModel?.toLowerCase().includes(search.toLowerCase()) ||
    t.issueReported?.toLowerCase().includes(search.toLowerCase())
  )

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await mutate()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Quick status change from list
  const handleQuickStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId)
    try {
      const res = await fetch(`/api/servicios/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`Estado actualizado: ${statusLabel(newStatus)}`)
      mutate()
    } catch {
      toast.error("Error al actualizar estado")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/servicios/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Ticket eliminado')
      setDeleteId(null)
      mutate()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  const getCountForFilter = (value: string) => {
    if (!value) return stats.total
    if (value === 'PENDING') return stats.pending
    if (value === 'IN_PROGRESS') return stats.inProgress
    if (value === 'COMPLETED') return stats.completed
    if (value === 'DELIVERED') return stats.delivered ?? 0
    return 0
  }

  return (
    <>
      {/* ── Delete Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
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
      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { href: '/admin/servicios', label: 'Total', count: stats.total, active: !statusFilter, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
          { href: '/admin/servicios?status=PENDING', label: 'Pendientes', count: stats.pending, active: statusFilter === 'PENDING', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
          { href: '/admin/servicios?status=IN_PROGRESS', label: 'En Proceso', count: stats.inProgress, active: statusFilter === 'IN_PROGRESS', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
          { href: '/admin/servicios?status=COMPLETED', label: 'Terminados', count: stats.completed, active: statusFilter === 'COMPLETED', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
          { href: '/admin/servicios?status=DELIVERED', label: 'Entregados', count: stats.delivered ?? 0, active: statusFilter === 'DELIVERED', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
        ].map(card => (
          <Link key={card.href} href={card.href}
            className={`${card.bg} p-4 rounded-xl border transition-all hover:shadow-sm ${card.active ? `${card.border} ring-2 ring-offset-1 shadow-sm` : card.border + ' hover:border-gray-300'}`}>
            <p className={`text-xs font-semibold ${card.text} opacity-70 mb-1`}>{card.label}</p>
            <p className={`text-2xl font-black ${card.text}`}>{card.count}</p>
          </Link>
        ))}
      </div>

      {/* ── Table card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filter pill tabs */}
        <div className="flex gap-2 overflow-x-auto p-4 pb-0 border-b border-gray-100">
          {[
            { label: 'Todos', value: '', color: 'gray' },
            { label: '🟠 Pendientes', value: 'PENDING', color: 'orange' },
            { label: '🔵 En Proceso', value: 'IN_PROGRESS', color: 'blue' },
            { label: '🟢 Terminados', value: 'COMPLETED', color: 'green' },
            { label: '⚫ Entregados', value: 'DELIVERED', color: 'gray' },
          ].map(f => (
            <Link key={f.value}
              href={f.value ? `/admin/servicios?status=${f.value}` : '/admin/servicios'}
              className={`whitespace-nowrap mb-3 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
                ${(statusFilter === f.value) || (!statusFilter && !f.value)
                  ? f.color === 'orange' ? 'bg-orange-500 text-white border-orange-500'
                    : f.color === 'blue' ? 'bg-blue-500 text-white border-blue-500'
                    : f.color === 'green' ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {f.label} ({getCountForFilter(f.value)})
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por N°, cliente, equipo, falla..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none bg-gray-50 focus:bg-white transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing || isValidating ? 'animate-spin' : ''}`} />
            {isRefreshing || isValidating ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket / Cliente</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Técnico</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredTickets.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <Link href={`/admin/servicios/${ticket.id}`} className="block">
                      <span className="text-sm font-bold text-blue-600 group-hover:text-blue-800">ST-{ticket.number.toString().padStart(4, '0')}</span>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">{ticket.client?.name || 'Sin cliente'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(ticket.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500 flex-shrink-0">
                        <MonitorSmartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.deviceBrand} {ticket.deviceModel}</p>
                        <p className="text-xs text-gray-400 max-w-[180px] truncate" title={ticket.issueReported}>{ticket.issueReported}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {/* Quick status dropdown */}
                      <select
                        value={ticket.status}
                        onChange={e => handleQuickStatus(ticket.id, e.target.value)}
                        disabled={updatingId === ticket.id}
                        className={`text-xs font-bold rounded-lg border px-2 py-1.5 outline-none cursor-pointer transition-all ${statusClass(ticket.status)} disabled:opacity-50`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded w-max
                        ${ticket.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                          ticket.paymentStatus === 'PARTIAL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {formatPrice(ticket.totalAmount)} · {ticket.paymentStatus === 'PAID' ? 'Pagado' : ticket.paymentStatus === 'PARTIAL' ? 'Abono' : 'Pendiente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {ticket.technician ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px] uppercase">
                          {ticket.technician.name.substring(0, 2)}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{ticket.technician.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/servicios/${ticket.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => { setDeleteId(ticket.id); setDeleteNum(ticket.number) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link href={`/admin/servicios/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold">
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Wrench className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                    <p className="text-base font-semibold text-gray-800 mb-1">Sin tickets encontrados</p>
                    <p className="text-sm text-gray-400">No hay servicios que coincidan con la búsqueda actual.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {filteredTickets.length} resultado{filteredTickets.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </div>
      </div>
    </>
  )
}
