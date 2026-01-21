'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface ProductFiltersProps {
  brands: string[]
}

const CATEGORIES = [
  'Laptops', 'PC Escritorio', 'Monitores', 'Periféricos', 'Componentes', 'Audio', 'Otros'
]

const CONDITIONS = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'LIKE_NEW', label: 'Open Box' },
  { value: 'USED', label: 'Usado' },
  { value: 'REFURBISHED', label: 'Reacondicionado' }
]

export default function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false) // Estado para abrir/cerrar en móvil

  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '')

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/?${params.toString()}`)
  }

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilter('q', localSearch)
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('min', minPrice)
    else params.delete('min')
    if (maxPrice) params.set('max', maxPrice)
    else params.delete('max')
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/')
    setMinPrice('')
    setMaxPrice('')
    setLocalSearch('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      
      {/* CABECERA (Botón Toggle en Móvil) */}
      <div 
        className="flex justify-between items-center p-5 border-b cursor-pointer md:cursor-default bg-gray-50 md:bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Filtros
        </h3>
        
        {/* Controles Derecha */}
        <div className="flex items-center gap-3">
          {(searchParams.toString().length > 0) && (
            <button 
              onClick={(e) => { e.stopPropagation(); clearFilters(); }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
          {/* Flecha solo en móvil */}
          <div className="md:hidden text-gray-500">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* CONTENIDO DE FILTROS (Oculto en móvil si !isOpen) */}
      <div className={`p-5 space-y-8 ${isOpen ? 'block' : 'hidden md:block'}`}>
        
        {/* Buscador */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Buscar</h4>
          <form onSubmit={handleLocalSearch} className="relative">
            <input 
              type="text" 
              placeholder="Ej: RTX 4060..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </form>
        </div>

        {/* Categorías */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categorías</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="radio" name="category" checked={!searchParams.get('category') || searchParams.get('category') === 'Todos'} onChange={() => applyFilter('category', null)} className="accent-blue-600 w-4 h-4" />
              <span className="text-sm text-gray-600 group-hover:text-blue-600">Todas</span>
            </label>
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                <input type="radio" name="category" checked={searchParams.get('category') === cat} onChange={() => applyFilter('category', cat)} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Marcas */}
        {brands.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Marcas</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="brand" checked={!searchParams.get('brand')} onChange={() => applyFilter('brand', null)} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-gray-600">Todas</span>
              </label>
              {brands.map((brand) => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer group">
                  <input type="radio" name="brand" checked={searchParams.get('brand') === brand} onChange={() => applyFilter('brand', brand)} className="accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Condición */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estado</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="condition" checked={!searchParams.get('condition')} onChange={() => applyFilter('condition', null)} className="accent-blue-600 w-4 h-4" />
              <span className="text-sm text-gray-600">Cualquiera</span>
            </label>
            {CONDITIONS.map((cond) => (
              <label key={cond.value} className="flex items-center space-x-2 cursor-pointer group">
                <input type="radio" name="condition" checked={searchParams.get('condition') === cond.value} onChange={() => applyFilter('condition', cond.value)} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{cond.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Precio (S/)</h4>
          <div className="flex items-center gap-2 mb-3">
            <input type="number" placeholder="Mín" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full p-2 text-sm border rounded-lg bg-gray-50 focus:bg-white outline-none" />
            <span className="text-gray-400">-</span>
            <input type="number" placeholder="Máx" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full p-2 text-sm border rounded-lg bg-gray-50 focus:bg-white outline-none" />
          </div>
          <button onClick={handlePriceApply} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
            Filtrar Precio
          </button>
        </div>

      </div>
    </div>
  )
}