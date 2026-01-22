import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

// Forzamos dinamismo para ver datos frescos
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Datos rápidos para el dashboard
  const productsCount = await prisma.product.count()
  const ordersCount = await prisma.order.count()
  const usersCount = await prisma.user.count() // Contamos usuarios también
  
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  // (Opcional) Calcular ingresos reales si deseas
  // const income = await prisma.order.aggregate({ _sum: { total: true } })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold opacity-90">Productos</h3>
          <p className="text-4xl font-bold mt-2">{productsCount}</p>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold opacity-90">Pedidos</h3>
          <p className="text-4xl font-bold mt-2">{ordersCount}</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold opacity-90">Usuarios</h3>
            <p className="text-4xl font-bold mt-2">{usersCount}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Accesos Rápidos</h2>
      
      {/* BOTONES DE GESTIÓN (Ahora son 5 columnas en PC grande) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        
        {/* 1. Productos */}
        <Link 
          href="/admin/productos"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-4 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 text-blue-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <span className="font-bold text-gray-700 group-hover:text-blue-600">Productos</span>
        </Link>

        {/* 2. Pedidos */}
        <Link 
          href="/admin/pedidos"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-4 bg-green-100 rounded-full mb-3 group-hover:bg-green-200 text-green-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <span className="font-bold text-gray-700 group-hover:text-green-600">Pedidos</span>
        </Link>

        {/* 3. USUARIOS (NUEVO) */}
        <Link 
          href="/admin/usuarios"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-4 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200 text-orange-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <span className="font-bold text-gray-700 group-hover:text-orange-600">Usuarios</span>
        </Link>

        {/* 4. Configurar Hero */}
        <Link 
          href="/admin/configuracion"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-4 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 text-purple-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-bold text-gray-700 group-hover:text-purple-600">Portada</span>
        </Link>

        {/* 5. Volver a Tienda */}
        <Link 
          href="/"
          className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 hover:bg-gray-100 transition-all flex flex-col items-center justify-center text-center group"
        >
           <div className="p-4 bg-gray-200 rounded-full mb-3 text-gray-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <span className="font-bold text-gray-600">Ir a Tienda</span>
        </Link>

      </div>

      {/* Tabla Resumen de Últimos Pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
            <h3 className="font-bold text-gray-700">Últimos Pedidos Recibidos</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                        <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {/* 🔥 Corrección crítica: Evita crash si es Invitado (user es null) */}
                                {order.shippingName || order.user?.name || 'Cliente Invitado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                {formatPrice(order.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                                <Link href={`/admin/pedidos/${order.id}`}>Ver detalle</Link>
                            </td>
                        </tr>
                    ))}
                    {recentOrders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                No hay pedidos recientes.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}