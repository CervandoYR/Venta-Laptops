'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { CheckCircle2, X, ShoppingCart, AlertCircle } from 'lucide-react'
import Link from 'next/link'

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

  // Función auxiliar para manejar el auto-cierre con limpieza de timer
  const startTimer = (duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
        setToast((prev) => prev ? { ...prev, visible: false } : null)
    }, duration)
  }

  const showToast = ({ product }: { product: { name: string, image: string, price: number } }) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'success', product })
    startTimer(5000) // 5s para compras (necesitan tiempo para ver el botón)
  }

  const showAdminToast = (message: string) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'admin-success', message })
    startTimer(3000) // ⚡ 3s para acciones admin (Rápido y ágil)
  }

  const showError = (message: string) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'error', message })
    startTimer(6000) // 6s para errores (necesitan leerse)
  }

  const closeToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast((prev) => prev ? { ...prev, visible: false } : null)
  }

  // Pausar si el usuario pone el mouse encima (UX PRO)
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  // Reanudar al quitar el mouse
  const handleMouseLeave = () => {
    if (toast?.visible) {
        startTimer(toast.type === 'success' ? 4000 : 2000)
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, showAdminToast, showError }}>
      {children}
      
      <div 
        className={`fixed top-24 right-4 z-[9999] transition-all duration-500 transform ${toast?.visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Toast Carrito */}
        {toast?.type === 'success' && toast.product && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-fade-in-left">
            <div className="bg-green-600 px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> ¡Agregado al carrito!</div>
              <button onClick={closeToast} className="hover:bg-green-700 p-1 rounded transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-white">
              <div className="flex gap-3 mb-4">
                <div className="relative w-16 h-16 border rounded bg-gray-50 flex-shrink-0">
                    <img src={toast.product.image || '/placeholder-laptop.jpg'} alt="" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-800 text-sm line-clamp-2">{toast.product.name}</h4></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={closeToast} className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition">Seguir comprando</button>
                <Link href="/carrito" onClick={closeToast} className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-1 transition shadow-sm"><ShoppingCart className="w-3 h-3" /> Ver Carrito</Link>
              </div>
            </div>
          </div>
        )}

        {/* Toast Admin (Éxito) */}
        {toast?.type === 'admin-success' && (
          <div className="bg-white rounded-xl shadow-xl border-l-4 border-green-500 w-80 p-4 flex items-center gap-3 animate-fade-in-left bg-gradient-to-r from-white to-green-50/30">
            <div className="p-2 bg-green-100 rounded-full text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">¡Listo!</h4>
                <p className="text-xs text-gray-600">{toast.message}</p>
            </div>
            <button onClick={closeToast} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Toast Error */}
        {toast?.type === 'error' && (
          <div className="bg-white rounded-xl shadow-xl border-l-4 border-red-500 w-80 p-4 flex items-start gap-3 animate-fade-in-left bg-gradient-to-r from-white to-red-50/30">
            <div className="p-2 bg-red-100 rounded-full text-red-600"><AlertCircle className="w-5 h-5" /></div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">Error</h4>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{toast.message}</p>
            </div>
            <button onClick={closeToast} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition"><X className="w-4 h-4" /></button>
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