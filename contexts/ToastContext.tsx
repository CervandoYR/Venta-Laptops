'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { CheckCircle2, X, ShoppingCart, AlertCircle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import UniversalImage from '@/components/ui/UniversalImage'

interface ToastData {
  id: number
  visible: boolean
  type: 'success' | 'error' | 'admin-success'
  product?: { name: string, image: string, price: number }
  message?: string
}

interface ToastContextType {
  showToast: (data: { product: { name: string, image: string, price: number } }) => void
  showAdminToast: (message: string) => void
  showError: (message: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = (duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
        setToast((prev) => prev ? { ...prev, visible: false } : null)
    }, duration)
  }

  const showToast = ({ product }: { product: { name: string, image: string, price: number } }) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'success', product })
    startTimer(5000)
  }

  const showAdminToast = (message: string) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'admin-success', message })
    startTimer(3000)
  }

  const showError = (message: string) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'error', message })
    startTimer(6000)
  }

  const closeToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast((prev) => prev ? { ...prev, visible: false } : null)
  }

  const handleMouseEnter = () => { if (timerRef.current) clearTimeout(timerRef.current) }
  const handleMouseLeave = () => { if (toast?.visible) startTimer(toast.type === 'success' ? 4000 : 2000) }

  return (
    <ToastContext.Provider value={{ showToast, showAdminToast, showError }}>
      {children}
      
      {/* ✅ CORRECCIÓN VISUAL:
          1. style={{ zIndex: 99999 }}: Fuerza bruta para estar encima de todo.
          2. top-24 md:top-32: Bajamos la notificación para que NO choque con el Navbar (que mide ~100px).
             Ahora aparecerá flotando limpiamente debajo del encabezado.
      */}
      <div 
        style={{ zIndex: 99999 }}
        className={`fixed top-24 md:top-32 right-4 md:right-6 transition-all duration-500 transform
          ${toast?.visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* --- 1. TOAST CARRITO (CLIENTE) --- */}
        {toast?.type === 'success' && toast.product && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-[90vw] md:w-80 overflow-hidden animate-fade-in-left">
            <div className="bg-green-600 px-4 py-3 flex justify-between items-center text-white shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> ¡Agregado al carrito!</div>
              <button onClick={closeToast} className="hover:bg-green-700/50 p-1 rounded transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-white">
              <div className="flex gap-3 mb-4">
                <div className="relative w-14 h-14 border border-gray-100 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <UniversalImage 
                      src={toast.product.image || '/placeholder-laptop.jpg'} 
                      alt={toast.product.name} 
                      className="w-full h-full object-contain p-1" 
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-800 text-xs md:text-sm line-clamp-2 leading-tight">{toast.product.name}</h4>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={closeToast} className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Seguir viendo</button>
                <Link href="/carrito" onClick={closeToast} className="px-3 py-2 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-black flex items-center justify-center gap-1 transition shadow-sm"><ShoppingCart className="w-3 h-3" /> Ver Carrito</Link>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. TOAST ADMIN (PANEL) --- */}
        {toast?.type === 'admin-success' && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-[90vw] md:w-80 overflow-hidden animate-fade-in-left">
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center text-white shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm"><ShieldCheck className="w-5 h-5" /> Acción Exitosa</div>
              <button onClick={closeToast} className="hover:bg-blue-700/50 p-1 rounded transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 flex items-center gap-3">
               <div className="p-2 bg-green-50 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-700 leading-snug">{toast.message}</p>
               </div>
            </div>
          </div>
        )}

        {/* --- 3. TOAST ERROR --- */}
        {toast?.type === 'error' && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-[90vw] md:w-80 overflow-hidden animate-fade-in-left">
            <div className="bg-red-600 px-4 py-3 flex justify-between items-center text-white shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm"><AlertCircle className="w-5 h-5" /> Ha ocurrido un error</div>
              <button onClick={closeToast} className="hover:bg-red-700/50 p-1 rounded transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 font-medium leading-snug">{toast.message}</p>
            </div>
          </div>
        )}

      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast missing ToastProvider')
  return context
}