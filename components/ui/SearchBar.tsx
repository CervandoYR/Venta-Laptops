'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  image: string
  brand: string
  category: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Cierra al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Búsqueda en vivo con "Debounce"
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          const data = await res.json()
          setResults(data)
          setIsOpen(true)
        } catch (error) {
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  // ✅ UX FIX: Bloquear scroll del fondo en móvil cuando el buscador está abierto
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      {/* ✅ OVERLAY MÓVIL: Oscurece el fondo para enfocar al usuario (solo móvil) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity animate-fade-in" />
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div 
        className={`relative w-full max-w-2xl mx-auto transition-all duration-200 z-[100] ${isOpen ? 'max-md:fixed max-md:inset-x-0 max-md:top-4 max-md:px-4' : ''}`} 
        ref={wrapperRef}
      >
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Busca laptops, componentes..."
            className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-transparent text-gray-800 rounded-2xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm md:text-base font-medium placeholder-gray-400"
          />
          
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Search className="w-5 h-5 group-focus-within:text-blue-500 transition-colors" />}
          </div>

          {query && (
            <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* ✅ CAJA DE RESULTADOS: Scroll inteligente para PC y Móvil */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-[80px] max-md:mt-0 max-md:rounded-t-2xl z-[100] animate-fade-in-up">
            
            <div className="md:hidden p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resultados</span>
              <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-blue-600">Cerrar</button>
            </div>

            {/* Lista con altura dinámica: En PC max 350px, en Móvil ocupa todo el alto libre */}
            <ul className="divide-y divide-gray-50 overflow-y-auto flex-1 custom-scrollbar md:max-h-[350px]">
              {results.map((product) => (
                <li key={product.id}>
                  <Link 
                    href={`/productos/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="w-14 h-14 relative flex-shrink-0 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <Image src={product.image} alt={product.name} fill className="object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors leading-tight">{product.name}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">{product.category} • {product.brand}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-extrabold text-blue-600">{formatPrice(product.price)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Botón Ver Todos */}
            <div className="bg-gray-50 p-3 md:p-3 text-center border-t border-gray-100 flex-shrink-0">
              <button onClick={handleSubmit} className="text-sm md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-2 md:py-0 w-full">
                Ver todos los resultados para "{query}" &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute top-full mt-2 w-full bg-white md:rounded-2xl shadow-2xl border border-gray-100 p-8 text-center max-md:fixed max-md:inset-x-0 max-md:top-[80px] max-md:mt-0 max-md:rounded-t-2xl z-[100]">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500 font-medium text-sm">No encontramos resultados para "<span className="text-gray-800 font-bold">{query}</span>"</p>
            <button onClick={() => setIsOpen(false)} className="md:hidden mt-4 text-xs font-bold text-blue-600">Cerrar búsqueda</button>
          </div>
        )}
      </div>
    </>
  )
}