"use client"

import { useState } from 'react'
import { Search, Plus, UserPlus, Phone, Mail, ShoppingCart, Wrench, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function ClientsClient({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.document && c.document.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
       const res = await fetch('/api/clientes', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, document, email, phone })
       })
       if (!res.ok) throw new Error(await res.text())
       const newClient = await res.json()
       
       // Add empty arrays for UI consistency
       newClient.tickets = []
       
       setClients([newClient, ...clients])
       setIsModalOpen(false)
       setName(''); setDocument(''); setEmail(''); setPhone('')
       toast.success("Cliente creado correctamente")
    } catch(err: any) {
       toast.error("Error: " + err.message)
    } finally {
       setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full max-w-sm">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Buscar cliente por nombre, DNI, email o teléfono..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
             />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center w-full sm:w-auto justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
           >
             <UserPlus className="w-4 h-4" />
             Nuevo Cliente
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicios Técnicos</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold uppercase">
                        {client.name.substring(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">
                          ID: {client.id.slice(-6).toUpperCase()} 
                          {client.document && ` | DNI/RUC: ${client.document}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {client.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-3 h-3 text-gray-400"/> {client.phone}</div>}
                      {client.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-3 h-3 text-gray-400"/> {client.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-gray-900">{client.tickets?.length || 0} Tickets</span>
                      {client.tickets?.length > 0 && (
                        <div className="flex gap-1">
                          {client.tickets.slice(0, 3).map((t: any) => (
                            <Link key={t.id} href={`/admin/servicios/${t.id}`} className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium border border-blue-100 transition-colors" title={`Ver ST-${t.number}`}>
                              ST-{t.number}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              
              {filteredClients.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                     No se han encontrado clientes.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800"><UserPlus className="w-5 h-5 text-purple-600"/> Registrar Cliente</h2>
             </div>
             <form onSubmit={handleCreate} className="p-6">
                 <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Nombre Completo *</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">DNI / RUC (Opcional)</label>
                      <input type="text" value={document} onChange={e => setDocument(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Teléfono / Celular *</label>
                      <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Correo Electrónico (Opcional)</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
                      <p className="text-xs text-gray-500 mt-1">Dejar vacío si no el cliente no proporciona correo.</p>
                    </div>
                 </div>
                 <div className="flex justify-end gap-3">
                    <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                      {loading ? 'Guardando...' : 'Crear Cliente'}
                    </button>
                 </div>
             </form>
          </div>
        </div>
      )}
    </>
  )
}
