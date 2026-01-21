'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product } from '@prisma/client'
import { slugify } from '@/lib/utils' // Asegúrate de que esta función exista en utils, si no, avísame.
import ImageUpload from '@/components/admin/ImageUpload'

// --- 1. ESQUEMA DE VALIDACIÓN (ZOD) ---
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  
  // Precios
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  originalPrice: z.number().optional().nullable(), // 👇 NUEVO: Precio de Lista
  
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  
  // Imágenes (Array)
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen'),

  // Selects
  category: z.string().default('Laptops'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED']).default('NEW'),
  conditionDetails: z.string().optional(),

  // Info Básica
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  
  // Specs Técnicas
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  gpu: z.string().optional(),

  // Specs Detalladas
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
  product?: Product | null // Aceptamos null para cuando es nuevo
}

// --- 2. COMPONENTE PRINCIPAL ---
export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Configuración del Formulario
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
          // Mapeo de campos opcionales para evitar nulls
          originalPrice: product.originalPrice, // 👇 Cargar precio original
          cpu: product.cpu || '', 
          ram: product.ram || '', 
          storage: product.storage || '', 
          display: product.display || '', 
          gpu: product.gpu || '',
          connectivity: product.connectivity || '', 
          ports: product.ports || '',
          battery: product.battery || '', 
          dimensions: product.dimensions || '',
          weight: product.weight || '', 
          sound: product.sound || '',
          category: product.category || 'Laptops',
          condition: (product.condition as any) || 'NEW',
          conditionDetails: product.conditionDetails || '',
          // Manejo de compatibilidad de imágenes (string único vs array)
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
          originalPrice: null,
      }
  })

  // Auto-generar slug si cambia el nombre
  const name = watch('name')
  useEffect(() => {
    if (name && !product && !watch('slug')) {
      setValue('slug', slugify(name))
    }
  }, [name, product, setValue, watch])

  // Lógica visual condicional
  const currentCategory = watch('category')
  const showSpecs = ['Laptops', 'PC Escritorio', 'Monitores', 'All in One'].includes(currentCategory)
  const currentCondition = watch('condition')
  const currentImages = watch('images') || []

  // --- 3. ENVÍO DEL FORMULARIO ---
  async function onSubmit(data: ProductFormData) {
    setError('')
    setLoading(true)

    try {
      // Preparamos payload (asegurando compatibilidad con campo 'image' legacy)
      const payload = { 
        ...data, 
        image: data.images[0] || '' 
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST' // Usamos PUT para editar

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

  // Helpers para imágenes
  const handleImageChange = (url: string) => {
    setValue('images', [...currentImages, url], { shouldValidate: true })
  }
  const handleImageRemove = (url: string) => {
    setValue('images', currentImages.filter(i => i !== url), { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-8 border border-gray-100">
      
      {/* MENSAJE DE ERROR GLOBAL */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
           ❌ {error}
        </div>
      )}

      {/* SECCIÓN 1: IMÁGENES (MÚLTIPLES) */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">Galería de Imágenes *</label>
        <ImageUpload 
            value={currentImages} 
            onChange={handleImageChange}
            onRemove={handleImageRemove}
        />
        {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images.message}</p>}
      </div>

      {/* SECCIÓN 2: INFO BÁSICA */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Producto *</label>
          <input {...register('name')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL Amigable) *</label>
          <input {...register('slug')} className="w-full p-2 border rounded-md bg-gray-50" />
          {errors.slug && <p className="text-red-600 text-sm">{errors.slug.message}</p>}
        </div>
      </div>

      {/* SECCIÓN 3: PRECIOS Y STOCK (CON CAMPO NUEVO) */}
      <div className="grid md:grid-cols-3 gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Precio Venta (S/) *</label>
          <input 
            type="number" 
            step="0.01" 
            {...register('price', { valueAsNumber: true })} 
            className="w-full p-2 border rounded-md font-bold text-lg" 
          />
          {errors.price && <p className="text-red-600 text-sm">{errors.price.message}</p>}
        </div>

        {/* 👇 CAMPO NUEVO PARA OFERTAS */}
        <div>
          <label className="block text-sm font-bold text-blue-800 mb-1">Precio Lista (Antes)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="Opcional"
            {...register('originalPrice', { valueAsNumber: true })} 
            className="w-full p-2 border border-blue-200 rounded-md bg-white" 
          />
          <p className="text-[10px] text-blue-600 mt-1">Llénalo para mostrar etiqueta de oferta.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock Disponible *</label>
          <input 
            type="number" 
            {...register('stock', { valueAsNumber: true })} 
            className="w-full p-2 border rounded-md" 
          />
          {errors.stock && <p className="text-red-600 text-sm">{errors.stock.message}</p>}
        </div>
      </div>

      {/* SECCIÓN 4: CATEGORÍA Y CONDICIÓN */}
      <div className="grid md:grid-cols-2 gap-6">
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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md animate-fade-in-down">
            <label className="block text-sm font-bold text-yellow-800 mb-1">Detalles del estado (Imperfecciones, caja, etc)</label>
            <input {...register('conditionDetails')} className="w-full p-2 border border-yellow-300 rounded-md" placeholder="Ej: Rayón leve en tapa, sin caja original..." />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Descripción Detallada *</label>
        <textarea {...register('description')} rows={4} className="w-full p-2 border rounded-md" />
        {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium mb-1">Marca *</label><input {...register('brand')} className="w-full p-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Modelo *</label><input {...register('model')} className="w-full p-2 border rounded-md" /></div>
      </div>

      {/* ESPECIFICACIONES TÉCNICAS (SOLO SI APLICA) */}
      {showSpecs && (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛠️ Especificaciones Técnicas
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Opcionales pero recomendados</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Procesador (CPU)</label><input {...register('cpu')} className="w-full p-2 border rounded-md" placeholder="Ej: Intel Core i7-1355U" /></div>
                <div><label className="block text-sm font-medium mb-1">Memoria RAM</label><input {...register('ram')} className="w-full p-2 border rounded-md" placeholder="Ej: 16GB DDR5" /></div>
                <div><label className="block text-sm font-medium mb-1">Almacenamiento</label><input {...register('storage')} className="w-full p-2 border rounded-md" placeholder="Ej: 1TB SSD NVMe" /></div>
                <div><label className="block text-sm font-medium mb-1">Pantalla</label><input {...register('display')} className="w-full p-2 border rounded-md" placeholder='Ej: 15.6" FHD IPS 144Hz' /></div>
                <div><label className="block text-sm font-medium mb-1">Gráficos (GPU)</label><input {...register('gpu')} className="w-full p-2 border rounded-md" placeholder="Ej: NVIDIA RTX 4060 8GB" /></div>
                
                {/* CAMPOS DETALLADOS */}
                <div className="col-span-2 border-t pt-4 mt-2"><p className="text-sm font-bold text-gray-700">Detalles Extra</p></div>
                
                <div><label className="block text-sm font-medium mb-1">Conectividad</label><input {...register('connectivity')} className="w-full p-2 border rounded-md" placeholder="Wi-Fi 6, Bluetooth 5.3" /></div>
                <div><label className="block text-sm font-medium mb-1">Puertos</label><input {...register('ports')} className="w-full p-2 border rounded-md" placeholder="1x HDMI 2.1, 2x USB-C..." /></div>
                <div><label className="block text-sm font-medium mb-1">Batería</label><input {...register('battery')} className="w-full p-2 border rounded-md" placeholder="3 celdas, 56Wh" /></div>
                <div><label className="block text-sm font-medium mb-1">Sonido</label><input {...register('sound')} className="w-full p-2 border rounded-md" placeholder="Stereo con Dolby Atmos" /></div>
                <div><label className="block text-sm font-medium mb-1">Dimensiones</label><input {...register('dimensions')} className="w-full p-2 border rounded-md" placeholder="36 x 24 x 1.9 cm" /></div>
                <div><label className="block text-sm font-medium mb-1">Peso</label><input {...register('weight')} className="w-full p-2 border rounded-md" placeholder="1.8 kg" /></div>
            </div>
        </div>
      )}

      {/* ESTADO DE VISIBILIDAD */}
      <div className="flex gap-6 border-t pt-6 bg-gray-50 p-4 rounded-lg">
        <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" {...register('featured')} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-bold text-gray-700">⭐ Destacado en Inicio</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" {...register('active')} className="w-5 h-5 rounded text-green-600 focus:ring-green-500" />
            <span className="text-sm font-bold text-gray-700">✅ Activo (Visible en tienda)</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-white border-t p-4 z-10">
        <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
            Cancelar
        </button>
        <button 
            type="submit" 
            disabled={loading} 
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
        >
            {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto')}
        </button>
      </div>
    </form>
  )
}