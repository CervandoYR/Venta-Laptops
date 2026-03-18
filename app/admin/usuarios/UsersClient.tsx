'use client'

import { useState } from 'react'
import { Search, Trash2, Shield, ShieldAlert, User as UserIcon, Mail, Calendar, Loader2, Plus, X, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserType {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  _count: { orders: number }
}

export function UsersClient({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' as 'ADMIN' | 'USER' })
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  // Filtro de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  // Función: Eliminar Usuario
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción borrará su historial.')) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      
      // Actualizar UI sin recargar
      setUsers(prev => prev.filter(u => u.id !== id))
      alert('Usuario eliminado correctamente')
    } catch (error) {
      alert('No se pudo eliminar al usuario')
    } finally {
      setLoadingId(null)
    }
  }

  // Función: Cambiar Rol (Toggle)
  const toggleRole = async (user: UserType) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const confirmMsg = newRole === 'ADMIN' 
        ? `¿Hacer ADMIN a ${user.name}? Tendrá acceso total.`
        : `¿Quitar permisos de admin a ${user.name}?`
    
    if (!confirm(confirmMsg)) return

    setLoadingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!res.ok) throw new Error('Error al actualizar')

      if (!res.ok) throw new Error('Error al actualizar')

      // Actualizar estado local
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      router.refresh() // Refresca datos de servidor por si acaso
    } catch (error) {
      alert('Error al cambiar el rol')
    } finally {
      setLoadingId(null)
    }
  }

  // Función: Crear Usuario Manual
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al crear usuario')
      }
      const createdUser = await res.json()
      // Añadir_count
      createdUser._count = { orders: 0 }
      setUsers([createdUser, ...users])
      setShowAddModal(false)
      setNewUser({ name: '', email: '', password: '', role: 'USER' })
      alert('Usuario creado correctamente')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white hover:bg-gray-100 rounded-full border shadow-sm transition-colors text-gray-600" title="Regresar al panel">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
            <p className="text-gray-500 mt-1">Administra accesos y visualiza clientes ({users.length})</p>
          </div>
        </div>
        
        {/* Buttons / Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowAddModal(true)}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Nuevo Usuario
          </button>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Usuario</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Rol</th>
                <th className="p-4 font-semibold text-gray-600 text-sm hidden md:table-cell">Registro</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Pedidos</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                  
                  {/* Info Principal */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rol con Badge */}
                  <td className="p-4">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        <ShieldAlert className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <UserIcon className="w-3 h-3" /> CLIENTE
                      </span>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Contador Pedidos */}
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                        {user._count.orders} compras
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Botón Editar Rol */}
                      {user.id !== currentUserId && (
                        <button 
                            onClick={() => toggleRole(user)}
                            disabled={loadingId === user.id}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title={user.role === 'ADMIN' ? 'Degradar a Usuario' : 'Promover a Admin'}
                        >
                            <Shield className="w-5 h-5" />
                        </button>
                      )}

                      {/* Botón Eliminar */}
                      {user.id !== currentUserId && (
                        <button 
                            onClick={() => handleDelete(user.id)}
                            disabled={loadingId === user.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar Usuario"
                        >
                            {loadingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-gray-500">
                No se encontraron usuarios que coincidan con "{search}"
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2"><UserIcon className="w-6 h-6 text-blue-600" /> Crear Nuevo Usuario</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña temporal</label>
                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mínimo 6 caracteres" minLength={6} />
                <p className="text-xs text-gray-500 mt-1">El usuario podrá cambiarla luego en su perfil.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Rol en la tienda</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                  <option value="USER">👤 Cliente / Usuario Normal</option>
                  <option value="ADMIN">🛡️ Administrador (Acceso Total)</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-gray-600 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {creating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}