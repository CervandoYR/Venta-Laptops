import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { 
  Wrench, FileText, Users, ShoppingBag, ShoppingCart, 
  MonitorSmartphone, LayoutDashboard, PlusCircle, Clock, 
  Package, UserCheck, TrendingUp, ArrowRight, CheckCircle2,
  AlertCircle, Truck
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const productsCount = await prisma.product.count()
  const ordersCount = await prisma.order.count()
  const usersCount = await prisma.user.count({ where: { role: 'USER' } })
  const clientsCount = await prisma.client.count()
  const ticketsCount = await prisma.ticket.count()
  const pendingTicketsCount = await prisma.ticket.count({ where: { status: 'PENDING' } })
  const inProgressTicketsCount = await prisma.ticket.count({ where: { status: 'IN_PROGRESS' } })
  
  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  const recentTickets = await prisma.ticket.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { client: true, technician: true }
  })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
      IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
      COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      DELIVERED: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    }
    return map[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso', COMPLETED: 'Terminado',
      DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
    }
    return map[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Administración</h1>
            </div>
            <p className="text-gray-500 text-sm ml-14">Gestiona tu tienda y servicio técnico desde aquí.</p>
          </div>
          <Link href="/admin/servicios/nuevo"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm">
            <PlusCircle className="w-5 h-5" /> Nuevo Servicio
          </Link>
        </div>

        {/* ── Metrics Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Servicios */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-500">
              <Wrench className="w-32 h-32" />
            </div>
            <p className="text-blue-200 font-semibold text-xs uppercase tracking-wider mb-2 relative z-10">Servicios Técnicos</p>
            <p className="text-5xl font-black relative z-10">{ticketsCount}</p>
            <div className="mt-3 flex gap-3 relative z-10">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🟠 {pendingTicketsCount} pendientes</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🔵 {inProgressTicketsCount} en proceso</span>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-2">Productos</p>
            <p className="text-4xl font-black text-gray-800">{productsCount}</p>
            <p className="text-xs text-gray-400 mt-2">En inventario</p>
            <Package className="w-12 h-12 text-gray-100 absolute right-4 bottom-4 group-hover:text-blue-100 transition-colors" />
          </div>

          {/* Pedidos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-green-200 hover:shadow-md transition-all">
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-2">Pedidos</p>
            <p className="text-4xl font-black text-gray-800">{ordersCount}</p>
            <p className="text-xs text-gray-400 mt-2">Órdenes recibidas</p>
            <ShoppingCart className="w-12 h-12 text-gray-100 absolute right-4 bottom-4 group-hover:text-green-100 transition-colors" />
          </div>

          {/* Clientes ST */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-2">Clientes ST</p>
            <p className="text-4xl font-black text-gray-800">{clientsCount}</p>
            <p className="text-xs text-gray-400 mt-2">Clientes de servicio técnico</p>
            <UserCheck className="w-12 h-12 text-gray-100 absolute right-4 bottom-4 group-hover:text-purple-100 transition-colors" />
          </div>
        </div>

        {/* ── Servicio Técnico Hero + Quick Access ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 🛠️ Main Module Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                <MonitorSmartphone className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Módulo Principal</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-blue-600" />
                  Servicio Técnico
                </h2>
                <p className="text-gray-400 mb-6 text-sm max-w-lg">
                  Gestiona reparaciones, asigna técnicos, genera tickets y da seguimiento en tiempo real.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Link href="/admin/servicios/nuevo"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-md transition-all flex flex-col items-center justify-center text-center group active:scale-95">
                    <PlusCircle className="w-7 h-7 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs">Nuevo Ticket</span>
                  </Link>
                  <Link href="/admin/servicios"
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 p-4 rounded-xl transition-all flex flex-col items-center justify-center text-center group active:scale-95">
                    <FileText className="w-7 h-7 mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    <span className="font-semibold text-xs">Ver Todos</span>
                  </Link>
                  <Link href="/admin/servicios?status=PENDING"
                    className="bg-orange-50 hover:bg-orange-100 border border-orange-100 text-orange-700 p-4 rounded-xl transition-all flex flex-col items-center justify-center text-center group active:scale-95">
                    <Clock className="w-7 h-7 mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs">Pendientes ({pendingTicketsCount})</span>
                  </Link>
                  <Link href="/admin/tecnicos"
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 p-4 rounded-xl transition-all flex flex-col items-center justify-center text-center group active:scale-95">
                    <Users className="w-7 h-7 mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    <span className="font-semibold text-xs">Técnicos</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tienda Online</p>
              <div className="space-y-2">
                <Link href="/admin/productos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag className="w-4 h-4"/></div>
                  <span className="font-medium text-sm text-gray-700">Inventario</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/pedidos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShoppingCart className="w-4 h-4"/></div>
                  <span className="font-medium text-sm text-gray-700">Pedidos</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 mb-3">Personas</p>
              <div className="space-y-2">
                <Link href="/admin/clientes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserCheck className="w-4 h-4"/></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-700 leading-tight">Clientes ST</p>
                    <p className="text-xs text-gray-400">Servicio técnico</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/usuarios" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-4 h-4"/></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-700 leading-tight">Usuarios</p>
                    <p className="text-xs text-gray-400">Cuentas e-commerce</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Services + Recent Orders ──── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Last Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                <Wrench className="w-5 h-5 text-blue-500" />Últimos Servicios
              </h3>
              <Link href="/admin/servicios" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTickets.map((ticket) => (
                <Link key={ticket.id} href={`/admin/servicios/${ticket.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    #{ticket.number.toString().padStart(3, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{ticket.client?.name || 'Sin cliente'}</p>
                    <p className="text-xs text-gray-400 truncate">{ticket.deviceBrand} {ticket.deviceModel} · {new Date(ticket.createdAt).toLocaleDateString('es-PE')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${statusBadge(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </span>
                    {ticket.technician && (
                      <p className="text-xs text-gray-400">{ticket.technician.name}</p>
                    )}
                  </div>
                </Link>
              ))}
              {recentTickets.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Wrench className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No hay servicios técnicos aún.</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                <ShoppingCart className="w-5 h-5 text-green-500" />Últimos Pedidos Tienda
              </h3>
              <Link href="/admin/pedidos" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.shippingName || order.user?.name || 'Invitado'}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-PE')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-black text-sm text-gray-900">{formatPrice(order.total)}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border
                      ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status === 'PENDING' ? 'Pendiente' : order.status === 'DELIVERED' ? 'Entregado' : order.status === 'SHIPPED' ? 'Enviado' : order.status}
                    </span>
                  </div>
                </Link>
              ))}
              {recentOrders.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <ShoppingCart className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No hay pedidos recientes.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}