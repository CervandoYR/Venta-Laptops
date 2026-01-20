'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product } from '@prisma/client'
import { slugify } from '@/lib/utils'
import ImageUpload from '@/components/admin/ImageUpload' // 👈 Ahora sí lo importamos

// Esquema de validación (Flexible para todos los productos)
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  
  // Imágenes (Array de URLs)
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen'),

  // Categoría y Condición
  category: z.string().default('Laptops'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED']).default('NEW'),
  conditionDetails: z.string().optional(),

  // Specs Opcionales (Solo si es compu)
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  gpu: z.string().optional(),

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
          // Aseguramos que los campos opcionales tengan string vacío si son null
          cpu: product.cpu || '',
          ram: product.ram || '',
          storage: product.storage || '',
          display: product.display || '',
          gpu: product.gpu || '',
          category: (product as any).category || 'Laptops',
          condition: ((product as any).condition as any) || 'NEW',
          conditionDetails: (product as any).conditionDetails || '',
          images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
        }
      : {
          slug: '',
          featured: false,
          active: true,
          stock: 0,
          category: 'Laptops',
          condition: 'NEW',
          images: [],
        },
  })

  // Auto-generar slug
  const name = watch('name')
  useEffect(() => {
    if (name && !product && !watch('slug')) {
      setValue('slug', slugify(name))
    }
  }, [name, product, setValue, watch])

  // Lógica para mostrar/ocultar specs
  const currentCategory = watch('category')
  const showSpecs = currentCategory === 'Laptops' || currentCategory === 'PC Escritorio'
  const currentCondition = watch('condition')
  const currentImages = watch('images')

  async function onSubmit(data: ProductFormData) {
    setError('')
    setLoading(true)

    try {
      // Preparamos los datos para enviar
      const payload = {
        ...data,
        // Usamos la primera imagen del array como la imagen principal
        image: data.images[0], 
      }

      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el producto')
      }

      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar el producto')
      setLoading(false)
    }
  }

  // Funciones para manejar el componente ImageUpload
  const handleImageChange = (url: string) => {
    // Agregamos la nueva URL al array existente
    const newImages = [...currentImages, url]
    setValue('images', newImages, { shouldValidate: true })
  }

  const handleImageRemove = (urlToRemove: string) => {
    const newImages = currentImages.filter(img => img !== urlToRemove)
    setValue('images', newImages, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* SECCIÓN DE IMÁGENES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto *</label>
        <ImageUpload 
            value={currentImages} 
            onChange={handleImageChange}
            onRemove={handleImageRemove}
        />
        {errors.images && (
            <p className="text-red-600 text-sm mt-1">{errors.images.message}</p>
        )}
      </div>

      {/* INFORMACIÓN BÁSICA */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input {...register('name')} className="w-full p-2 border rounded-md" />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
          <input {...register('slug')} className="w-full p-2 border rounded-md" />
          {errors.slug && <p className="text-red-600 text-sm">{errors.slug.message}</p>}
        </div>
      </div>

      {/* CATEGORÍA Y CONDICIÓN */}
      <div className="grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-md border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select {...register('category')} className="w-full p-2 border rounded-md bg-white">
            <option value="Laptops">Laptops</option>
            <option value="PC Escritorio">PC Escritorio</option>
            <option value="Monitores">Monitores</option>
            <option value="Periféricos">Periféricos (Mouse/Teclado)</option>
            <option value="Audio">Audio</option>
            <option value="Componentes">Componentes</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
          <select {...register('condition')} className="w-full p-2 border rounded-md bg-white">
            <option value="NEW">Nuevo (Sellado)</option>
            <option value="LIKE_NEW">Como Nuevo (Open Box)</option>
            <option value="USED">Usado / Segunda</option>
            <option value="REFURBISHED">Reacondicionado</option>
          </select>
        </div>
      </div>

      {/* DETALLES DE CONDICIÓN (Solo si no es nuevo) */}
      {currentCondition !== 'NEW' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <label className="block text-sm font-bold text-yellow-800 mb-1">
                ⚠️ Detalles del estado (Honestidad con el cliente)
            </label>
            <input 
                {...register('conditionDetails')} 
                placeholder="Ej: Rayón en la tapa, batería al 85%, sin caja..." 
                className="w-full p-2 border border-yellow-300 rounded-md text-sm" 
            />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea {...register('description')} rows={4} className="w-full p-2 border rounded-md" />
        {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/) *</label>
          <input 
            type="number" 
            step="0.01" 
            {...register('price', { valueAsNumber: true })} 
            className="w-full p-2 border rounded-md" 
          />
          {errors.price && <p className="text-red-600 text-sm">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
          <input 
            type="number" 
            {...register('stock', { valueAsNumber: true })} 
            className="w-full p-2 border rounded-md" 
          />
          {errors.stock && <p className="text-red-600 text-sm">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
          <input {...register('brand')} className="w-full p-2 border rounded-md" />
          {errors.brand && <p className="text-red-600 text-sm">{errors.brand.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
          <input {...register('model')} className="w-full p-2 border rounded-md" />
          {errors.model && <p className="text-red-600 text-sm">{errors.model.message}</p>}
        </div>
      </div>

      {/* ESPECIFICACIONES TÉCNICAS (Solo si es Laptop/PC) */}
      {showSpecs && (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Especificaciones Técnicas</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procesador (CPU)</label>
                    <input {...register('cpu')} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Memoria RAM</label>
                    <input {...register('ram')} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Almacenamiento</label>
                    <input {...register('storage')} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pantalla</label>
                    <input {...register('display')} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gráficos (GPU)</label>
                    <input {...register('gpu')} className="w-full p-2 border rounded-md" />
                </div>
            </div>
        </div>
      )}

      {/* ESTADO */}
      <div className="flex gap-6 border-t pt-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" {...register('featured')} className="rounded w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Producto Destacado</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" {...register('active')} className="rounded w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Activo (Visible en tienda)</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto')}
        </button>
      </div>
    </form>
  )
}