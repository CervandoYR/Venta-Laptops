'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Bot, Sparkles, RotateCcw, ExternalLink, MessageSquare, ChevronDown, ArrowRight } from 'lucide-react'
// ❌ Borramos next/image
// import Image from 'next/image' 
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
// ✅ Importamos tu componente todoterreno
import UniversalImage from '@/components/ui/UniversalImage'

interface ProductResult {
  id: string
  name: string
  price: number
  image: string
  slug: string
  category: string
}

interface Message {
  id: number
  role: 'bot' | 'user'
  text?: string
  options?: { label: string; value: string; nextStep: number }[]
  products?: ProductResult[]
}

export default function KiroAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [filters, setFilters] = useState<any>({})
  
  const pathname = usePathname()
  
  const isProductPage = pathname?.includes('/productos/')
  
  // Posicionamiento
  const positionClasses = isProductPage 
    ? 'bottom-28 md:bottom-24' 
    : 'bottom-6 md:bottom-24'

  const shouldHide = pathname?.includes('/checkout') || pathname?.includes('/admin') || pathname?.includes('/login') || pathname?.includes('/registro')

  const steps = [
    {
      id: 0,
      text: "👋 ¡Hola! Soy Kiro. 🤖\n\nResponde 3 preguntas y encontraré la laptop ideal para ti.\n\n¿Para qué la usarás?",
      options: [
        { label: "🏢 Trabajo / Oficina", value: "work", nextStep: 1 },
        { label: "🎓 Estudios / Universidad", value: "study", nextStep: 1 },
        { label: "🎮 Gaming / Juegos", value: "gaming", nextStep: 2 },
        { label: "🎨 Diseño / Ingeniería", value: "design", nextStep: 2 },
        { label: "🏠 Uso Hogar / Básico", value: "home", nextStep: 3 },
      ]
    },
    {
      id: 1, // Rama Productividad
      text: "Entendido. ¿Qué priorizas más?",
      options: [
        { label: "🪶 Que sea ligera", value: "light", nextStep: 3 },
        { label: "⚡ Velocidad (Multitarea)", value: "fast", nextStep: 3 },
        { label: "💰 El mejor precio", value: "budget", nextStep: 3 },
      ]
    },
    {
      id: 2, // Rama Potencia
      text: "¿Qué nivel de potencia gráfica buscas?",
      options: [
        { label: "🚀 Máxima (Gamer Pro)", value: "pro", nextStep: 3 },
        { label: "⚖️ Balanceada", value: "mid", nextStep: 3 },
        { label: "🏁 Básica", value: "entry", nextStep: 3 },
      ]
    },
    {
      id: 3, // Presupuesto
      text: "¿Cuál es tu presupuesto aproximado?",
      options: [
        { label: "💵 Hasta S/ 1,800", value: "low", nextStep: 99 },
        { label: "💵 S/ 1,800 - S/ 3,000", value: "mid", nextStep: 99 },
        { label: "💵 S/ 3,000 - S/ 5,000", value: "high", nextStep: 99 },
        { label: "💎 Sin límite", value: "premium", nextStep: 99 },
      ]
    }
  ]

  useEffect(() => {
    if (isOpen && history.length === 0) {
      addBotMessage(steps[0])
    }
  }, [isOpen])

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history, isTyping, isOpen])

  const addBotMessage = (step: any, customText?: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setHistory(prev => [...prev, { 
        id: Date.now(), 
        role: 'bot', 
        text: customText || step.text, 
        options: step.options 
      }])
      setIsTyping(false)
    }, 600)
  }

  const fetchProductsSmartly = async (criteria: any) => {
    const getProducts = async (params: URLSearchParams) => {
      try {
        const res = await fetch(`/api/search?${params.toString()}`)
        if (!res.ok) return []
        const data = await res.json()
        return Array.isArray(data) ? data : []
      } catch (e) {
        return [] 
      }
    }

    let params = new URLSearchParams()
    // REGLA: Siempre Laptops
    params.set('category', 'Laptops')

    // Precios
    if (criteria.price === 'low') params.set('max', '2000')
    if (criteria.price === 'mid') { params.set('min', '1800'); params.set('max', '3500') }
    if (criteria.price === 'high') { params.set('min', '3000'); params.set('max', '6000') }
    if (criteria.price === 'premium') params.set('min', '4500')

    // Keywords
    if (criteria.usage === 'gaming') params.set('q', 'rtx') 
    else if (criteria.usage === 'design') params.set('q', 'core') 
    else if (criteria.usage === 'work' && criteria.sub === 'light') params.set('q', 'book') 

    // INTENTO 1
    let products = await getProducts(params)

    // INTENTO 2
    if (products.length === 0) {
      params.delete('q') 
      products = await getProducts(params)
    }

    // INTENTO 3
    if (products.length === 0) {
      params.delete('min')
      params.delete('max')
      products = await getProducts(params)
    }

    return products.filter((p: any) => p.price > 500).slice(0, 5)
  }

  const handleOptionClick = async (option: any) => {
    setHistory(prev => [...prev, { id: Date.now(), role: 'user', text: option.label }])
    
    const newFilters = { ...filters, [`step_${option.nextStep}`]: option.value }
    setFilters(newFilters)

    if (option.nextStep === 99) {
      setIsTyping(true)
      
      const criteria = {
        usage: newFilters.step_1 || newFilters.step_2 || newFilters.step_3, 
        sub: newFilters.step_3,
        price: option.value 
      }

      const results = await fetchProductsSmartly(criteria)

      setTimeout(() => {
        if (results.length > 0) {
          setHistory(prev => [...prev, { 
            id: Date.now(), 
            role: 'bot', 
            text: "¡Aquí tienes las mejores opciones disponibles! 🎯",
            products: results 
          }])
          
          setTimeout(() => {
             setHistory(prev => [...prev, { 
                id: Date.now() + 1, 
                role: 'bot', 
                text: "¿Deseas ver más modelos?",
                options: [
                    { label: "📦 Ver Catálogo Completo", value: "all", nextStep: 100 },
                    { label: "🔄 Buscar de nuevo", value: "reset", nextStep: 0 }
                ] 
             }])
          }, 1000)
        } else {
          setHistory(prev => [...prev, { 
            id: Date.now(), 
            role: 'bot', 
            text: "Mis disculpas, parece que no hay laptops disponibles en este momento.",
            options: [{ label: "Ver Catálogo Completo", value: "all", nextStep: 100 }]
          }])
        }
        setIsTyping(false)
      }, 1200)

    } else if (option.nextStep === 0) {
        setHistory([])
        setFilters({})
        addBotMessage(steps[0])
    } else if (option.nextStep === 100) {
        window.location.href = '/?category=Laptops'
    } else {
      const nextStepData = steps.find(s => s.id === option.nextStep)
      if (nextStepData) addBotMessage(nextStepData)
    }
  }

  const resetChat = () => {
    setHistory([])
    setFilters({})
    setTimeout(() => addBotMessage(steps[0]), 200)
  }

  if (shouldHide) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[100] flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 group border font-bold text-sm
          ${isOpen ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-blue-600 border-blue-100'}
          ${positionClasses} left-4 md:left-auto md:right-4
        `}
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : (
          <div className="relative">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        )}
        <span className="hidden md:block group-hover:text-purple-600 transition-colors">
          {isOpen ? 'Ocultar' : 'Asistente IA'}
        </span>
        <span className="md:hidden">Asistente</span>
      </button>

      <div className={`
        fixed z-[101] bg-white shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col border border-gray-200 overflow-hidden
        ${isOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-12 pointer-events-none'}
        bottom-0 left-0 right-0 h-[80vh] rounded-t-3xl
        md:h-[600px] md:w-[380px] md:bottom-24 md:right-4 md:left-auto md:rounded-2xl md:bottom-[110px]
      `}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/10">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none mb-1">Asistente Kiro</h3>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-medium uppercase tracking-wide">En línea</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={resetChat} className="p-2 hover:bg-white/20 rounded-full transition" title="Reiniciar">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition" title="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 scroll-smooth">
          {history.map((msg) => (
            <div key={msg.id} className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
              {msg.text && (
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-br-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              )}
              {msg.products && (
                <div className="w-full pl-1 mt-2">
                  <div className="flex gap-4 overflow-x-auto pb-6 w-full snap-x no-scrollbar px-1">
                    {msg.products.map((product) => (
                      <div key={product.id} className="min-w-[200px] w-[200px] bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-100 overflow-hidden snap-center flex-shrink-0 flex flex-col hover:border-purple-200 transition-colors">
                        
                        {/* ✅ USO DE UNIVERSAL IMAGE AQUÍ */}
                        <div className="relative h-32 w-full bg-gray-50 p-4 border-b border-gray-50 flex items-center justify-center">
                          <UniversalImage 
                            src={product.image || '/placeholder-laptop.jpg'} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>

                        <div className="p-3 flex flex-col flex-1">
                          <h4 className="font-bold text-xs text-gray-800 line-clamp-2 mb-2 leading-snug h-8">{product.name}</h4>
                          <p className="text-blue-600 font-extrabold text-sm mb-3">{formatPrice(product.price)}</p>
                          <Link 
                            href={`/productos/${product.slug}`} 
                            target="_blank"
                            className="mt-auto w-full bg-gray-900 text-white text-[10px] py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:bg-black transition"
                          >
                            Ver Detalles <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* TARJETA FINAL "VER MÁS" */}
                    <div 
                      onClick={() => window.location.href = '/?category=Laptops'}
                      className="min-w-[140px] w-[140px] bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm overflow-hidden snap-center flex-shrink-0 flex flex-col items-center justify-center group cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-blue-700 text-center px-2">Ver Catálogo Completo</p>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-1 bg-white p-3 rounded-2xl w-fit"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 shrink-0 min-h-[70px] flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
          {!isTyping && history.length > 0 && history[history.length - 1].role === 'bot' && history[history.length - 1].options ? (
            <div className="flex flex-wrap gap-2 justify-center w-full">
              {history[history.length - 1].options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 text-center animate-fade-in"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
             !isTyping && history.length > 0 && <span className="text-xs text-gray-400 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Fin de la conversación</span>
          )}
        </div>
      </div>
    </>
  )
}