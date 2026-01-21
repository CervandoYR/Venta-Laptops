'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (query.trim()) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    
    // Resetear página al buscar
    params.delete('page')
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className={`relative w-full max-w-xl ${className}`}>
      <input
        type="text"
        placeholder="¿Qué estás buscando? (ej. Laptop Gamer)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-transparent focus:border-blue-400 bg-white text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none transition-all text-sm md:text-base font-medium"
      />
      <button 
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-100 p-1.5 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  )
}