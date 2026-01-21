'use client'

import { Search, X, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface AdminSearchFilterProps {
  placeholder?: string
  filterOptions?: {
    key: string
    label: string // Título del filtro (ej: Categoría)
    options: FilterOption[]
  }[]
}

export default function AdminSearchFilter({ placeholder = "Buscar...", filterOptions = [] }: AdminSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Estado local para el input de búsqueda
  const [query, setQuery] = useState(searchParams.get('q') || '')

  // Función para actualizar URL
  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Resetear página a 1 si filtramos
    params.delete('page') 

    startTransition(() => {
      router.replace(`?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('q', query)
  }

  const handleClear = () => {
    setQuery('')
    router.replace(window.location.pathname) // Limpia todo
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      
      {/* BUSCADOR */}
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </form>

      {/* FILTROS DINÁMICOS */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        {filterOptions.map((filter) => (
          <div key={filter.key} className="relative">
            <select 
              value={searchParams.get(filter.key) || ''}
              onChange={(e) => updateParams(filter.key, e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition-colors min-w-[140px]"
            >
              <option value="">{filter.label}: Todos</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        ))}

        {/* BOTÓN LIMPIAR */}
        {hasFilters && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" /> Borrar Filtros
          </button>
        )}
      </div>
    </div>
  )
}