'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ProductFiltersProps {
  brands: string[] // Recibimos las marcas disponibles desde la DB
}

export default function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estados locales
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || ''
  })

  // Función para aplicar cualquier filtro
  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  // Aplicar precio con botón
  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceRange.min) params.set('min', priceRange.min)
    else params.delete('min')
    
    if (priceRange.max) params.set('max', priceRange.max)
    else params.delete('max')
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  // Limpiar todo
  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    router.push('/', { scroll: false })
  }

  const currentCondition = searchParams.get('condition')
  const currentBrand = searchParams.get('brand')

  return (
    <div className="bg-white p-5 rounded-lg border shadow-sm space-y-8 sticky top-24">
      
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Filtrar por</h3>
        <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
          Limpiar
        </button>
      </div>

      {/* Rango de Precio */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-gray-700">Precio (S/)</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <button 
          onClick={applyPrice}
          className="w-full bg-gray-900 text-white py-1 rounded text-sm hover:bg-gray-800"
        >
          Aplicar
        </button>
      </div>

      {/* Condición (Estado) */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-gray-700">Estado</h4>
        <div className="space-y-2">
          {[
            { label: 'Todos', value: 'all' },
            { label: 'Nuevo (Sellado)', value: 'NEW' },
            { label: 'Como Nuevo (Open Box)', value: 'LIKE_NEW' },
            { label: 'Segunda Mano', value: 'USED' },
            { label: 'Reacondicionado', value: 'REFURBISHED' },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                checked={(currentCondition || 'all') === option.value}
                onChange={() => applyFilter('condition', option.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Marcas (Dinámicas) */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-gray-700">Marca</h4>
        <select 
          value={currentBrand || 'all'}
          onChange={(e) => applyFilter('brand', e.target.value)}
          className="w-full p-2 border rounded text-sm bg-white"
        >
          <option value="all">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

    </div>
  )
}