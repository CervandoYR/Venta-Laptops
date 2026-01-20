'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product } from '@prisma/client'
import { slugify } from '@/lib/utils'
import ImageUpload from '@/components/admin/ImageUpload'

// Esquema de validación completo
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

  // Specs
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  
  // Specs Técnicas (Opcionales)
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  gpu: z.string().optional(),

  // Specs Detalladas (NUEVAS)
  connectivity: z.string().optional(),
  ports: z.string().optional(),
  battery: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  sound: z.string().optional(),

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
          // Mapeo seguro para evitar nulls
          cpu: (product as any).cpu || '', 
          ram: (product as any).ram || '', 
          storage: (product as any).storage || '', 
          display: (product as any).display || '', 
          gpu: (product as any).gpu || '',
          connectivity: (product as any).connectivity || '', 
          ports: (product as any).ports || '',
          battery: (product as any).battery || '', 
          dimensions: (product as any).dimensions || '',
          weight: (product as any).weight || '', 
          sound: (product as any).sound || '',
          
          category: (product as any).category || 'Laptops',
          condition: ((product as any).condition as any) || 'NEW',
          conditionDetails: (product as any).conditionDetails || '',
          images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
        }
      : {
          slug: '', featured: false, active: true, stock: 0, category: 'Laptops', condition: 'NEW', images: [],
      }
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
  const showSpecs = ['Laptops', 'PC Escritorio', 'Monitores', 'All in One'].includes(currentCategory)
  const currentCondition = watch('condition')
  const currentImages = watch('images')

  async function onSubmit(data: ProductFormData) {
    setError('')
    setLoading(true)

    try {
      // Preparamos los datos
      const payload = { ...data, image: data.images[0] } // Compatibilidad

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error al guardar')

      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar el producto')
      setLoading(false)
    }
  }

  // Funciones para ImageUpload
  const handleImageChange = (url: string) => setValue('images', [...currentImages, url], { shouldValidate: true })
  const handleImageRemove = (url: string) => setValue('images', currentImages.filter(i => i !== url), { shouldValidate: true })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-8">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>}

      {/* SECCIÓN DE IMÁGENES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto *</label>
        <ImageUpload 
            value={currentImages} 
            onChange={handleImageChange}
            onRemove={handleImageRemove}
        />
        {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images.message}</p>}
      </div>

      {/* INFORMACIÓN BÁSICA */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input {...register('name')} className="w-full p-2 border rounded-md" />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
          <input {...register('slug')} className="w-full p-2 border rounded-md" />
          {errors.slug && <p className="text-red-600 text-sm">{errors.slug.message}</p>}
        </div>
      </div>

      {/* CATEGORÍA Y CONDICIÓN */}
      <div className="grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select {...register('category')} className="w-full p-2 border rounded-md bg-white">
            <option value="Laptops">Laptops</option>
            <option value="PC Escritorio">PC Escritorio</option>
            <option value="Monitores">Monitores</option>
            <option value="Periféricos">Periféricos</option>
            <option value="Audio">Audio</option>
            <option value="Componentes">Componentes</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Condición</label>
          <select {...register('condition')} className="w-full p-2 border rounded-md bg-white">
            <option value="NEW">Nuevo (Sellado)</option>
            <option value="LIKE_NEW">Como Nuevo (Open Box)</option>
            <option value="USED">Usado / Segunda</option>
            <option value="REFURBISHED">Reacondicionado</option>
          </select>
        </div>
      </div>

      {currentCondition !== 'NEW' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <label className="block text-sm font-bold text-yellow-800 mb-1">Detalles del estado</label>
            <input {...register('conditionDetails')} className="w-full p-2 border border-yellow-300 rounded-md" placeholder="Ej: Rayón en tapa..." />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Descripción *</label>
        <textarea {...register('description')} rows={4} className="w-full p-2 border rounded-md" />
        {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Precio (S/) *</label>
          <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          {errors.price && <p className="text-red-600 text-sm">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock *</label>
          <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          {errors.stock && <p className="text-red-600 text-sm">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium mb-1">Marca *</label><input {...register('brand')} className="w-full p-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Modelo *</label><input {...register('model')} className="w-full p-2 border rounded-md" /></div>
      </div>

      {/* ESPECIFICACIONES TÉCNICAS */}
      {showSpecs && (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Especificaciones Técnicas (Opcionales)</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Procesador (CPU)</label><input {...register('cpu')} className="w-full p-2 border rounded-md" placeholder="Ej: Core i5" /></div>
                <div><label className="block text-sm font-medium mb-1">Memoria RAM</label><input {...register('ram')} className="w-full p-2 border rounded-md" placeholder="Ej: 16GB" /></div>
                <div><label className="block text-sm font-medium mb-1">Almacenamiento</label><input {...register('storage')} className="w-full p-2 border rounded-md" placeholder="Ej: 512GB SSD" /></div>
                <div><label className="block text-sm font-medium mb-1">Pantalla</label><input {...register('display')} className="w-full p-2 border rounded-md" placeholder='Ej: 15.6" HD' /></div>
                <div><label className="block text-sm font-medium mb-1">Gráficos (GPU)</label><input {...register('gpu')} className="w-full p-2 border rounded-md" placeholder="Ej: RTX 4060" /></div>
                
                {/* NUEVOS CAMPOS */}
                <div className="col-span-2 border-t pt-4 mt-2"><p className="text-sm font-semibold text-gray-500">Detalles Adicionales</p></div>
                
                <div><label className="block text-sm font-medium mb-1">Conectividad</label><input {...register('connectivity')} className="w-full p-2 border rounded-md" placeholder="Wi-Fi 6, BT 5.3" /></div>
                <div><label className="block text-sm font-medium mb-1">Puertos</label><input {...register('ports')} className="w-full p-2 border rounded-md" placeholder="HDMI, USB-C" /></div>
                <div><label className="block text-sm font-medium mb-1">Batería</label><input {...register('battery')} className="w-full p-2 border rounded-md" placeholder="3 celdas, 41Wh" /></div>
                <div><label className="block text-sm font-medium mb-1">Sonido</label><input {...register('sound')} className="w-full p-2 border rounded-md" placeholder="Altavoces Estéreo" /></div>
                <div><label className="block text-sm font-medium mb-1">Dimensiones</label><input {...register('dimensions')} className="w-full p-2 border rounded-md" placeholder="36x23x1.8 cm" /></div>
                <div><label className="block text-sm font-medium mb-1">Peso</label><input {...register('weight')} className="w-full p-2 border rounded-md" placeholder="1.52 kg" /></div>
            </div>
        </div>
      )}

      <div className="flex gap-6 border-t pt-6">
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('featured')} className="rounded" /><span className="text-sm font-medium">Destacado</span></label>
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('active')} className="rounded" /><span className="text-sm font-medium">Activo</span></label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}</button>
      </div>
    </form>
  )
}