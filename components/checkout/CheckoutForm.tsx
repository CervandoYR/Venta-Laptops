'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loadStripe } from '@stripe/stripe-js'
import { Product } from '@prisma/client'

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  shippingEmail: z.string().email('Email inválido'),
  shippingAddress: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  shippingCity: z.string().min(2, 'La ciudad es requerida'),
  shippingPostalCode: z.string().min(4, 'Código postal inválido'),
  shippingCountry: z.string().min(2, 'El país es requerido'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  cartItems: Array<{
    productId: string
    product: Product
    quantity: number
  }>
  total: number
}

export function CheckoutForm({ cartItems, total }: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingCountry: 'México',
    },
  })

  async function onSubmit(data: CheckoutFormData) {
    setError('')
    setLoading(true)

    try {
      // Crear payment intent
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shipping: data,
          total,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el pago')
      }

      // Redirigir a Stripe Checkout
      if (result.sessionId) {
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        )

        if (stripe) {
          await stripe.redirectToCheckout({
            sessionId: result.sessionId,
          })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Información de Envío</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shippingName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            id="shippingName"
            {...register('shippingName')}
            className="input"
            placeholder="Juan Pérez"
          />
          {errors.shippingName && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shippingEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="shippingEmail"
            type="email"
            {...register('shippingEmail')}
            className="input"
            placeholder="tu@email.com"
          />
          {errors.shippingEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingEmail.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección *
        </label>
        <input
          id="shippingAddress"
          {...register('shippingAddress')}
          className="input"
          placeholder="Calle y número"
        />
        {errors.shippingAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <input
            id="shippingCity"
            {...register('shippingCity')}
            className="input"
            placeholder="Ciudad de México"
          />
          {errors.shippingCity && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingCity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal *
          </label>
          <input
            id="shippingPostalCode"
            {...register('shippingPostalCode')}
            className="input"
            placeholder="12345"
          />
          {errors.shippingPostalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingPostalCode.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shippingCountry" className="block text-sm font-medium text-gray-700 mb-1">
            País *
          </label>
          <input
            id="shippingCountry"
            {...register('shippingCountry')}
            className="input"
            placeholder="México"
          />
          {errors.shippingCountry && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingCountry.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-lg py-3"
      >
        {loading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
      </button>
    </form>
  )
}
