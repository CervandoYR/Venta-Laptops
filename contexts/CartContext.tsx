'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { Product } from '@prisma/client'

interface CartItem {
  id: Key | null | undefined
  productId: string
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
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

  // Cargar carrito al iniciar
  useEffect(() => {
    loadCart()
  }, [session])

  async function loadCart() {
    setLoading(true)
    try {
      if (session?.user) {
        // Cargar desde DB
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } else {
        // Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cart')
          if (stored) {
            const cartItems = JSON.parse(stored)
            // Cargar productos completos
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
      // Agregar a DB
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      if (response.ok) {
        await loadCart()
      }
    } else {
      // Agregar a localStorage
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

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
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
