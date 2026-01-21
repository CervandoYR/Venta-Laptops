'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { Product } from '@prisma/client'

// Definimos la interfaz del Item del carrito
interface CartItem {
  id?: string // Opcional, ya que en localStorage al inicio no tiene ID de DB
  productId: string
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  cartTotal: number // 👇 Agregado para que funcione el Checkout
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar carrito al iniciar o cambiar sesión
  useEffect(() => {
    loadCart()
  }, [session])

  async function loadCart() {
    setLoading(true)
    try {
      if (session?.user) {
        // MODO USUARIO LOGUEADO: Cargar desde DB
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } else {
        // MODO INVITADO: Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cart')
          if (stored) {
            const cartItems = JSON.parse(stored)
            // Cargar datos frescos de los productos
            const products = await Promise.all(
              cartItems.map(async (item: { productId: string; quantity: number }) => {
                try {
                  const res = await fetch(`/api/products/${item.productId}`)
                  if (res.ok) {
                    const product = await res.json()
                    return { ...item, product }
                  }
                } catch (error) {
                  console.error('Error loading product:', error)
                }
                return null
              })
            )
            setItems(products.filter(Boolean) as CartItem[])
          } else {
             setItems([])
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addItem(product: Product, quantity: number = 1) {
    if (session?.user) {
      // DB
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      if (response.ok) {
        await loadCart()
      }
    } else {
      // LocalStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cart')
        const cartItems = stored ? JSON.parse(stored) : []
        const existingIndex = cartItems.findIndex(
          (item: { productId: string }) => item.productId === product.id
        )

        if (existingIndex >= 0) {
          cartItems[existingIndex].quantity += quantity
        } else {
          cartItems.push({ productId: product.id, quantity })
        }

        localStorage.setItem('cart', JSON.stringify(cartItems))
        await loadCart()
      }
    }
  }

  async function removeItem(productId: string) {
    if (session?.user) {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await loadCart()
      }
    } else {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cart')
        if (stored) {
          const cartItems = JSON.parse(stored).filter(
            (item: { productId: string }) => item.productId !== productId
          )
          localStorage.setItem('cart', JSON.stringify(cartItems))
          await loadCart()
        }
      }
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }

    if (session?.user) {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      if (response.ok) {
        await loadCart()
      }
    } else {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cart')
        if (stored) {
          const cartItems = JSON.parse(stored).map(
            (item: { productId: string; quantity: number }) =>
              item.productId === productId ? { ...item, quantity } : item
          )
          localStorage.setItem('cart', JSON.stringify(cartItems))
          await loadCart()
        }
      }
    }
  }

  async function clearCart() {
    if (session?.user) {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })
      if (response.ok) {
        await loadCart()
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
        setItems([])
      }
    }
  }

  // Cálculos Automáticos
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        cartTotal, // Ahora disponible para toda la app
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}