'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react'

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
  const [isOpen, setIsOpen] = useState(false)

  // --- ESTADOS LOCALES (Para respuesta instantánea) ---
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '')
  
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '')

  // Sincronizar con URL (Por si el usuario usa "Atrás")
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '')
    setSelectedBrand(searchParams.get('brand') || '')
    setSelectedCondition(searchParams.get('condition') || '')
    setMinPrice(searchParams.get('min') || '')
    setMaxPrice(searchParams.get('max') || '')
    setLocalSearch(searchParams.get('q') || '')
  }, [searchParams])

  // --- FUNCIÓN DE FILTRADO ---
  const applyFilter = (key: string, value: string | null) => {
    // 1. UI Optimista (Cambio visual inmediato)
    if (key === 'category') setSelectedCategory(value || '')
    if (key === 'brand') setSelectedBrand(value || '')
    if (key === 'condition') setSelectedCondition(value || '')

    // 2. Lógica URL
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    
    // Evita el scroll al top
    router.push(`/?${params.toString()}`, { scroll: false })
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
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedCondition('')
    setMinPrice('')
    setMaxPrice('')
    setLocalSearch('')
    router.push('/', { scroll: false })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      
      {/* CABECERA */}
      <div 
        className="flex justify-between items-center p-5 border-b cursor-pointer md:cursor-default bg-gray-50 md:bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Filtros
        </h3>
        
        <div className="flex items-center gap-3">
          {(searchParams.toString().length > 0) && (
            <button 
              onClick={(e) => { e.stopPropagation(); clearFilters(); }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100 transition hover:bg-red-100"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
          <div className="md:hidden text-gray-500">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
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

        {/* Categorías (SIN RADIO BUTTONS) */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categorías</h4>
          <div className="space-y-1">
            <button 
                onClick={() => applyFilter('category', null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${!selectedCategory ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <span>Todas</span>
                {!selectedCategory && <Check className="w-4 h-4" />}
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => applyFilter('category', cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Marcas */}
        {brands.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Marcas</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              <button 
                  onClick={() => applyFilter('brand', null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${!selectedBrand ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  <span>Todas</span>
                  {!selectedBrand && <Check className="w-4 h-4" />}
              </button>
              {brands.map((brand) => (
                <button 
                  key={brand}
                  onClick={() => applyFilter('brand', brand)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedBrand === brand ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>{brand}</span>
                  {selectedBrand === brand && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Condición */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estado</h4>
          <div className="space-y-1">
            <button 
                onClick={() => applyFilter('condition', null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${!selectedCondition ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <span>Cualquiera</span>
                {!selectedCondition && <Check className="w-4 h-4" />}
            </button>
            {CONDITIONS.map((cond) => (
              <button 
                key={cond.value}
                onClick={() => applyFilter('condition', cond.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedCondition === cond.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{cond.label}</span>
                {selectedCondition === cond.value && <Check className="w-4 h-4" />}
              </button>
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