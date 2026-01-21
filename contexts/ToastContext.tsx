'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, X, ShoppingCart, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ToastData {
  id: number
  visible: boolean
  type: 'success' | 'error'
  product?: { name: string, image: string, price: number }
  message?: string
}

interface ToastContextType {
  showToast: (data: { product: { name: string, image: string, price: number } }) => void
  showError: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// 👇 Named Export
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)

  const showToast = ({ product }: { product: { name: string, image: string, price: number } }) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'success', product })
    setTimeout(() => {
      setToast((prev) => (prev?.id === newId ? { ...prev, visible: false } : prev))
    }, 5000)
  }

  const showError = (message: string) => {
    const newId = Date.now()
    setToast({ id: newId, visible: true, type: 'error', message })
    setTimeout(() => {
      setToast((prev) => (prev?.id === newId ? { ...prev, visible: false } : prev))
    }, 4000)
  }

  const closeToast = () => toast && setToast({ ...toast, visible: false })

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      {/* Toast UI */}
      <div className={`fixed top-24 right-4 z-[9999] transition-all duration-500 transform ${toast?.visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
        {toast && toast.type === 'success' && toast.product && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-fade-in-left">
            <div className="bg-green-600 px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> ¡Agregado!</div>
              <button onClick={closeToast}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-white">
              <div className="flex gap-3 mb-4">
                <div className="relative w-16 h-16 border rounded bg-gray-50"><Image src={toast.product.image || '/placeholder-laptop.jpg'} alt="" fill className="object-contain p-1" /></div>
                <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-800 text-sm line-clamp-2">{toast.product.name}</h4></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={closeToast} className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Seguir</button>
                <Link href="/carrito" onClick={closeToast} className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-1"><ShoppingCart className="w-3 h-3" /> Carrito</Link>
              </div>
            </div>
          </div>
        )}
        {toast && toast.type === 'error' && (
          <div className="bg-white rounded-xl shadow-xl border-l-4 border-red-500 w-80 p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div><h4 className="font-bold text-gray-900 text-sm">Error</h4><p className="text-xs text-gray-600">{toast.message}</p></div>
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