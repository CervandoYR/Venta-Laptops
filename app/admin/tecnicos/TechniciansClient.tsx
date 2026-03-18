"use client"

import { useState } from 'react'
import { HardHat, Plus, Search, Phone, Mail, MessageCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TechniciansClient({ initialTechnicians }: { initialTechnicians: any[] }) {
  const router = useRouter()
  const [technicians, setTechnicians] = useState(initialTechnicians)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const filteredTechnicians = technicians.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.email && t.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
       const res = await fetch('/api/tecnicos', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, phone, whatsapp })
       })
       if (!res.ok) throw new Error(await res.text())
       const newTech = await res.json()
       
       newTech.tickets = []
       setTechnicians([newTech, ...technicians])
       setIsModalOpen(false)
       setName(''); setEmail(''); setPhone(''); setWhatsapp('')
       router.refresh()
    } catch(err: any) {
       alert("Error: " + err.message)
    } finally {
       setLoading(false)
    }
  }

  const handleDelete = async (id: string, ticketsCount: number) => {
    if (ticketsCount > 0) {
      alert("No puedes eliminar un técnico que tiene tickets asignados. Reasigna los tickets primero.")
      return
    }
    if (!confirm("¿Eliminar este técnico?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tecnicos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTechnicians(technicians.filter(t => t.id !== id))
      router.refresh()
    } catch (e) {
      alert("Error eliminando técnico")
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
               placeholder="Buscar técnico..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none"
             />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center w-full sm:w-auto justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
           >
             <Plus className="w-4 h-4" />
             Añadir Técnico
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/30">
           {filteredTechnicians.map(tech => (
             <div key={tech.id} className="bg-white border text-center border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                <button onClick={() => handleDelete(tech.id, tech.tickets.length)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 border-4 border-white shadow-sm">
                  {tech.name.substring(0,2).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{tech.name}</h3>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                  {tech.phone && <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Phone className="w-3 h-3"/> {tech.phone}</span>}
                  {tech.whatsapp && <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded"><MessageCircle className="w-3 h-3"/> {tech.whatsapp}</span>}
                </div>
                {tech.email && <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mb-6"><Mail className="w-3 h-3 text-gray-400" /> {tech.email}</p>}
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                   <div className="text-left">
                     <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Carga Actual</p>
                     <p className="font-bold text-gray-900">{tech.tickets.filter((t:any) => t.status === 'IN_PROGRESS' || t.status === 'PENDING').length} tickets activos</p>
                   </div>
                   <div className="text-right">
                     <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Histórico</p>
                     <p className="font-bold text-gray-900">{tech.tickets.length} total</p>
                   </div>
                </div>
             </div>
           ))}
           {filteredTechnicians.length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
               <HardHat className="w-12 h-12 mx-auto text-gray-300 mb-3" />
               <p>No se encontraron técnicos</p>
             </div>
           )}
        </div>
      </div>

      {/* Modal Nuevo Tecnico */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800"><HardHat className="w-5 h-5 text-orange-600"/> Nuevo Técnico</h2>
             </div>
             <form onSubmit={handleCreate} className="p-6">
                 <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Nombre Completo *</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Teléfono Móvil</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Opcional" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block text-green-600">WhatsApp</label>
                        <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Con código de país" className="w-full px-4 py-2 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Correo de contacto</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Opcional" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                 </div>
                 <div className="flex justify-end gap-3">
                    <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                      {loading ? 'Guardando...' : 'Añadir Técnico'}
                    </button>
                 </div>
             </form>
          </div>
        </div>
      )}
    </>
  )
}
