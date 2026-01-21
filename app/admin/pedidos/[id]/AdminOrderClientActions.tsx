'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, MapPin, Truck } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
    orderId: string
    mode: 'delete' | 'edit_shipping'
    initialData?: {
        address: string
        city: string
        zip: string
    }
}

export default function AdminOrderClientActions({ orderId, mode, initialData }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false) // Estado modal
    
    // Estado formulario
    const [formData, setFormData] = useState({
        shippingAddress: initialData?.address || '',
        shippingCity: initialData?.city || '',
        shippingPostalCode: initialData?.zip || ''
    })

    // --- LÓGICA ELIMINAR ---
    if (mode === 'delete') {
        const handleDelete = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
                if(res.ok) {
                    router.push('/admin/pedidos')
                    router.refresh()
                } else {
                    alert('Error al eliminar')
                }
            } catch(e) { console.error(e) }
            // No reseteamos loading para evitar que el usuario de click de nuevo mientras redirige
        }

        return (
            <>
                <button 
                    onClick={() => setShowDeleteModal(true)} // Abrir modal
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-200 text-sm font-bold"
                >
                    <Trash2 className="w-4 h-4" /> Eliminar Pedido
                </button>

                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    title="¿Eliminar Permanentemente?"
                    message="Estás a punto de borrar este pedido y todo su historial de la base de datos. Esta acción es irreversible."
                    confirmText="Eliminar Pedido"
                    variant="danger" // Color rojo peligro
                    isLoading={loading}
                />
            </>
        )
    }

    // --- LÓGICA EDITAR ENVÍO (Igual que antes) ---
    if (mode === 'edit_shipping') {
        const handleUpdate = async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/orders/${orderId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                if(res.ok) {
                    setIsEditing(false)
                    router.refresh()
                }
            } catch(e) { console.error(e) }
            setLoading(false)
        }

        return (
            <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-500" /> Envío
                    </h3>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs text-blue-600 hover:underline font-bold"
                    >
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Dirección</label>
                            <input 
                                type="text" 
                                value={formData.shippingAddress} 
                                onChange={e => setFormData({...formData, shippingAddress: e.target.value})}
                                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Ciudad</label>
                            <input 
                                type="text" 
                                value={formData.shippingCity} 
                                onChange={e => setFormData({...formData, shippingCity: e.target.value})}
                                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 flex justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900">Dirección:</p>
                                <p>{formData.shippingAddress || 'A coordinar'}</p>
                            </div>
                        </div>
                        <div className="pl-6">
                            <p className="font-bold text-gray-900">Ciudad:</p>
                            <p>{formData.shippingCity || '-'}</p>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return null
}