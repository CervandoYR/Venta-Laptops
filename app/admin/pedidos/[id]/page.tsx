import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { ArrowLeft, Save, Trash2, MapPin, User, Mail, Truck } from 'lucide-react'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'
import AdminOrderClientActions from './AdminOrderClientActions'

// 1. COMPONENTE DE SERVIDOR (Carga datos)
export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    
    // Obtenemos orden directo de BD
    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: { include: { product: true } }, user: true }
    })

    if (!order) return <div className="p-10 text-center">Pedido no encontrado</div>

    // Pasamos los datos al componente interactivo
    return (
        <div className="p-6 max-w-5xl mx-auto">
            
            {/* Header y Botones */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/admin/pedidos" className="flex items-center text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Volver
                </Link>
                
                {/* Botón Eliminar (Lógica cliente) */}
                <AdminOrderClientActions orderId={order.id} mode="delete" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                
                {/* COLUMNA IZQUIERDA: DETALLES */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('es-PE')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-extrabold text-blue-600">{formatPrice(order.total)}</p>
                                <span className="text-xs text-gray-400">Total</span>
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Estado del Pedido</label>
                            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                        </div>

                        <h3 className="font-bold text-gray-800 mb-3">Productos</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center border-b pb-3 last:border-0">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                                        <Image src={item.product.image || '/placeholder-laptop.jpg'} alt={item.product.name} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-700">{formatPrice(item.price)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: DATOS */}
                <div className="space-y-6">
                    
                    {/* Cliente */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" /> Cliente
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" /> 
                                <span className="font-medium text-gray-900">{order.user?.name || order.shippingName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" /> 
                                <span className="text-blue-600">{order.user?.email || order.shippingEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Envío (Formulario Interactivo) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <AdminOrderClientActions 
                            orderId={order.id} 
                            mode="edit_shipping" 
                            initialData={{
                                address: order.shippingAddress,
                                city: order.shippingCity,
                                zip: order.shippingPostalCode
                            }}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}