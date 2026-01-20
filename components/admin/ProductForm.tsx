'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product } from '@prisma/client'
import { slugify } from '@/lib/utils'

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  image: z.string().url('URL de imagen inválida'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  cpu: z.string().min(1, 'El CPU es requerido'),
  ram: z.string().min(1, 'La RAM es requerida'),
  storage: z.string().min(1, 'El almacenamiento es requerido'),
  display: z.string().min(1, 'La pantalla es requerida'),
  gpu: z.string().optional(),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          gpu: product.gpu || '',
        }
      : {
          slug: '',
          featured: false,
          active: true,
          stock: 0,
          gpu: '',
        },
  })

  // Auto-generate slug from name
  const name = watch('name')
  if (name && !product && !watch('slug')) {
    setValue('slug', slugify(name))
  }

  async function onSubmit(data: ProductFormData) {
    setError('')
    setLoading(true)

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el producto')
      }

      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input id="name" {...register('name')} className="input" />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL) *
          </label>
          <input id="slug" {...register('slug')} className="input" />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="input"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio (MXN) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="input"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock *
          </label>
          <input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="input"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            URL de Imagen *
          </label>
          <input id="image" {...register('image')} className="input" />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <input id="brand" {...register('brand')} className="input" />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input id="model" {...register('model')} className="input" />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cpu" className="block text-sm font-medium text-gray-700 mb-1">
          Procesador (CPU) *
        </label>
        <input id="cpu" {...register('cpu')} className="input" />
        {errors.cpu && (
          <p className="mt-1 text-sm text-red-600">{errors.cpu.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ram" className="block text-sm font-medium text-gray-700 mb-1">
            RAM *
          </label>
          <input id="ram" {...register('ram')} className="input" />
          {errors.ram && (
            <p className="mt-1 text-sm text-red-600">{errors.ram.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="storage" className="block text-sm font-medium text-gray-700 mb-1">
            Almacenamiento *
          </label>
          <input id="storage" {...register('storage')} className="input" />
          {errors.storage && (
            <p className="mt-1 text-sm text-red-600">{errors.storage.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="display" className="block text-sm font-medium text-gray-700 mb-1">
            Pantalla *
          </label>
          <input id="display" {...register('display')} className="input" />
          {errors.display && (
            <p className="mt-1 text-sm text-red-600">{errors.display.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="gpu" className="block text-sm font-medium text-gray-700 mb-1">
            Tarjeta Gráfica (GPU) - Opcional
          </label>
          <input id="gpu" {...register('gpu')} className="input" />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('featured')}
            className="rounded"
          />
          <span className="text-sm font-medium">Producto Destacado</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('active')}
            className="rounded"
          />
          <span className="text-sm font-medium">Activo</span>
        </label>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
