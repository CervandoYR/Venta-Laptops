'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ImageUpload from '@/components/admin/ImageUpload'
import { Loader2, Save, Sparkles, X, ClipboardPaste, Plus, Trash2, LayoutGrid, DollarSign, Box, ChevronDown, Check, AlertCircle } from 'lucide-react'
import { parseDeltronText } from '@/lib/parsers'
import { useToast } from '@/contexts/ToastContext'

// --- LISTA MAESTRA DE MARCAS ---
const POPULAR_BRANDS = [
  'HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'MSI', 'Apple', 
  'Samsung', 'LG', 'Logitech', 'Razer', 'Corsair', 'HyperX', 
  'Kingston', 'Western Digital', 'Seagate', 'Intel', 'AMD', 
  'Nvidia', 'Gigabyte', 'Epson', 'Canon', 'Brother', 'Xiaomi'
]

// Slugify helper (Limpia el texto para la URL)
const slugify = (text: string) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')

// ✅ SCHEMA DE VALIDACIÓN (Mensajes de error personalizados)
const productSchema = z.object({
  name: z.string().min(3, 'El nombre es muy corto (mínimo 3 letras)'),
  slug: z.string().min(3, 'El enlace (slug) es obligatorio'),
  description: z.string().optional(), // 👈 AHORA ES OPCIONAL
  price: z.number({ invalid_type_error: "Ingresa un precio válido" }).min(0.01, 'El precio debe ser mayor a 0'),
  originalPrice: z.number().optional().nullable(),
  stock: z.number({ invalid_type_error: "Ingresa un stock válido" }).min(0, 'El stock no puede ser negativo'),
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen principal'),
  category: z.string().default('Laptops'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED']).default('NEW'),
  conditionDetails: z.string().optional(),
  brand: z.string().min(1, 'Debes seleccionar o escribir una marca'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  // Specs opcionales
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  gpu: z.string().optional(),
  connectivity: z.string().optional(),
  ports: z.string().optional(),
  battery: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  sound: z.string().optional(),
  specifications: z.record(z.string()).optional(), 
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: any
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { showAdminToast, showError } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Estados para Importador
  const [showImporter, setShowImporter] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  
  // Estado para la tabla dinámica de specs
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([])

  // --- LÓGICA DEL COMBOBOX DE MARCAS ---
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandWrapperRef = useRef<HTMLDivElement>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
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
          condition: product.condition || 'NEW',
          conditionDetails: product.conditionDetails || '',
          brand: product.brand || '',
          model: product.model || '',
          description: product.description || '',
          images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
          specifications: product.specifications || {}
        }
      : {
          slug: '', featured: false, active: true, stock: 0, category: 'Laptops', condition: 'NEW', images: [], originalPrice: null, specifications: {}, description: ''
        }
  })

  // Cerrar dropdown de marcas al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandWrapperRef.current && !brandWrapperRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sincronizar Specs JSON <-> UI
  useEffect(() => {
    if (product?.specifications && specsList.length === 0) {
      const list = Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
      setSpecsList(list)
    }
  }, [product])

  useEffect(() => {
    const specsObject: Record<string, string> = {}
    specsList.forEach(item => { if(item.key && item.value) specsObject[item.key] = item.value })
    form.setValue('specifications', specsObject)
  }, [specsList])

  // --- AUTOCOMPLETADO INTELIGENTE DEL SLUG ---
  const nameValue = form.watch('name')
  useEffect(() => {
    // Si estamos CREANDO un producto nuevo (no editando), actualizamos el slug automáticamente
    if (nameValue && !product) {
      form.setValue('slug', slugify(nameValue), { shouldValidate: true })
    }
  }, [nameValue, product, form])

  // Importador IA (Deltron Parser)
  const handleSmartImport = () => {
    if (!pasteContent) return
    const parsed = parseDeltronText(pasteContent)
    if (parsed.brand) form.setValue('brand', parsed.brand)
    if (parsed.model) form.setValue('model', parsed.model)
    if (parsed.cpu) form.setValue('cpu', parsed.cpu)
    if (parsed.ram) form.setValue('ram', parsed.ram)
    if (parsed.storage) form.setValue('storage', parsed.storage)
    if (parsed.display) form.setValue('display', parsed.display)
    if (parsed.gpu) form.setValue('gpu', parsed.gpu)
    if (parsed.ports) form.setValue('ports', parsed.ports)
    if (parsed.battery) form.setValue('battery', parsed.battery)
    
    const newSpecs = Object.entries(parsed.specs).map(([key, value]) => ({ key, value }))
    const currentKeys = specsList.map(s => s.key)
    const filteredNewSpecs = newSpecs.filter(s => !currentKeys.includes(s.key))
    setSpecsList(prev => [...prev, ...filteredNewSpecs])

    if (!form.getValues('name')) {
       form.setValue('name', `${parsed.brand} ${parsed.model} ${parsed.cpu || ''}`.trim())
    }
    if (!form.getValues('description')) {
        form.setValue('description', parsed.description)
    }
    setShowImporter(false)
    setPasteContent('')
  }

  // Guardar Producto
  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const payload = { ...data, image: data.images[0] || '' }
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al guardar')

      showAdminToast(product ? 'Producto actualizado correctamente' : 'Producto creado con éxito')
      
      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      showError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const addSpecRow = () => setSpecsList([...specsList, { key: '', value: '' }])
  const removeSpecRow = (idx: number) => setSpecsList(specsList.filter((_, i) => i !== idx))
  const updateSpecRow = (idx: number, field: 'key' | 'value', val: string) => {
    const newList = [...specsList]
    newList[idx][field] = val
    setSpecsList(newList)
  }

  const currentImages = form.watch('images') || []
  
  // Filtrado de marcas para el dropdown
  const brandInput = form.watch('brand')
  const filteredBrands = POPULAR_BRANDS.filter(b => 
    b.toLowerCase().includes(brandInput?.toLowerCase() || '')
  )

  return (
    <div className="relative">
      
      {/* MODAL IMPORTADOR */}
      {showImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> Importador IA</h3>
                    <button onClick={() => setShowImporter(false)}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex-1 p-4 bg-gray-50 overflow-auto">
                    <textarea className="w-full h-full p-4 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500" placeholder="Pega aquí el texto de Deltron..." value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} />
                </div>
                <div className="p-5 border-t bg-white flex justify-end gap-3">
                    <button onClick={() => setShowImporter(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold">Cancelar</button>
                    <button onClick={handleSmartImport} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><ClipboardPaste className="w-4 h-4" /> Procesar</button>
                </div>
            </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-8 border border-gray-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <button type="button" onClick={() => setShowImporter(true)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100"><Sparkles className="w-4 h-4" /> Importar Datos</button>
        </div>

        {/* IMÁGENES */}
        <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Galería de Imágenes *</label>
            <ImageUpload 
                value={currentImages} 
                onChange={(url) => form.setValue('images', [...currentImages, url], { shouldValidate: true })} 
                onRemove={(url) => form.setValue('images', currentImages.filter(i => i !== url), { shouldValidate: true })} 
            />
            {/* 🔴 MENSAJE ERROR IMÁGENES */}
            {form.formState.errors.images && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium animate-pulse">
                    <AlertCircle className="w-3 h-3" /> {form.formState.errors.images.message}
                </p>
            )}
        </div>

        {/* INFO BÁSICA MEJORADA (NOMBRE Y SLUG) */}
        <div className="grid md:grid-cols-2 gap-6">
            {/* Campo Nombre */}
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Nombre del Producto *</label>
                <input 
                    {...form.register('name')} 
                    className={`w-full p-2.5 border rounded-lg transition-all outline-none ${form.formState.errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Ej: Laptop Asus TUF Gaming F15..."
                />
                {/* 🔴 MENSAJE ERROR NOMBRE */}
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{form.formState.errors.name.message}</p>}
            </div>

            {/* Campo Slug con UX Mejorada */}
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Enlace (Slug) *</label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-mono select-none">
                        /productos/
                    </span>
                    <input 
                        {...form.register('slug')} 
                        className={`w-full p-2.5 border border-gray-300 rounded-r-lg outline-none font-mono text-sm transition-all focus:ring-2 focus:ring-blue-500 ${product ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        placeholder="se-genera-solo"
                        readOnly={!!product} // Se bloquea si es edición
                    />
                </div>
                {form.formState.errors.slug && <p className="text-red-500 text-xs mt-1 font-medium">{form.formState.errors.slug.message}</p>}
                <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    {product 
                        ? "🔒 La URL no se puede cambiar para no perder el posicionamiento en Google." 
                        : "✨ Se genera automáticamente al escribir el nombre."}
                </p>
            </div>
        </div>

        {/* PRECIOS Y STOCK */}
        <div className="grid md:grid-cols-3 gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Precio Venta (S/) *</label>
                <input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} className={`w-full p-2 border rounded-md font-bold text-lg ${form.formState.errors.price ? 'border-red-400 focus:ring-red-200' : 'border-blue-200'}`} />
                {form.formState.errors.price && <p className="text-red-600 text-xs mt-1 font-bold">{form.formState.errors.price.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-bold text-blue-800 mb-1">Precio Lista (Antes)</label>
                <input type="number" step="0.01" {...form.register('originalPrice', { valueAsNumber: true })} className="w-full p-2 border border-blue-200 rounded-md bg-white text-gray-500" placeholder="Opcional" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input type="number" {...form.register('stock', { valueAsNumber: true })} className={`w-full p-2 border rounded-md ${form.formState.errors.stock ? 'border-red-400' : ''}`} />
                {form.formState.errors.stock && <p className="text-red-600 text-xs mt-1">{form.formState.errors.stock.message}</p>}
            </div>
        </div>

        {/* CATEGORÍA Y CONDICIÓN */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select {...form.register('category')} className="w-full p-2 border rounded-md bg-white">
                    {['Laptops', 'PC Escritorio', 'Monitores', 'Periféricos', 'Componentes', 'Audio'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Condición</label>
                <select {...form.register('condition')} className="w-full p-2 border rounded-md bg-white">
                    <option value="NEW">Nuevo (Sellado)</option>
                    <option value="LIKE_NEW">Como Nuevo (Open Box)</option>
                    <option value="USED">Usado</option>
                    <option value="REFURBISHED">Reacondicionado</option>
                </select>
            </div>
        </div>

        {/* DESCRIPCIÓN OPCIONAL */}
        <div>
            <label className="block text-sm font-medium mb-1">Descripción <span className="text-gray-400 font-normal text-xs">(Opcional, Puede ser Texto o HTML para mejorar texto)</span></label>
            <textarea 
                {...form.register('description')} 
                rows={4} 
                className="w-full p-2 border border-gray-300 rounded-md text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Escribe los detalles aquí..." 
            />
            <p className="text-xs text-gray-400 mt-1">Puedes escribir texto normal. Si deseas formato avanzado (negrita, listas), puedes usar etiquetas HTML básicas.</p>
        </div>

        {/* MARCA Y MODELO */}
        <div className="grid md:grid-cols-2 gap-6">
            {/* ✅ COMBOBOX DE MARCA INTELIGENTE */}
            <div className="relative" ref={brandWrapperRef}>
                <label className="block text-sm font-medium mb-1">Marca *</label>
                <div className="relative">
                    <input 
                        {...form.register('brand')} 
                        className={`w-full p-2 border rounded-md pr-10 ${form.formState.errors.brand ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'}`} 
                        placeholder="Selecciona o escribe..."
                        onFocus={() => setShowBrandDropdown(true)}
                        autoComplete="off"
                    />
                    <button type="button" onClick={() => setShowBrandDropdown(!showBrandDropdown)} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"><ChevronDown className="w-4 h-4" /></button>
                </div>
                
                {/* 🔴 MENSAJE ERROR MARCA */}
                {form.formState.errors.brand && <p className="text-red-500 text-xs mt-1 font-medium">{form.formState.errors.brand.message}</p>}

                {showBrandDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filteredBrands.length > 0 ? (
                            filteredBrands.map(b => (
                                <button key={b} type="button" onClick={() => { form.setValue('brand', b); setShowBrandDropdown(false) }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex justify-between items-center group">
                                    {b} {form.watch('brand') === b && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-xs text-gray-500 italic">Presiona enter para guardar "{brandInput}" como nueva marca.</div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Modelo *</label>
                <input {...form.register('model')} className={`w-full p-2 border rounded-md ${form.formState.errors.model ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'}`} />
                {/* 🔴 MENSAJE ERROR MODELO */}
                {form.formState.errors.model && <p className="text-red-500 text-xs mt-1 font-medium">{form.formState.errors.model.message}</p>}
            </div>
        </div>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-600" /> Información Técnica</h3>
            <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input {...form.register('cpu')} placeholder="CPU" className="p-2 border rounded-md" />
                <input {...form.register('ram')} placeholder="RAM" className="p-2 border rounded-md" />
                <input {...form.register('storage')} placeholder="Disco" className="p-2 border rounded-md" />
                <input {...form.register('display')} placeholder="Pantalla" className="p-2 border rounded-md" />
                <input {...form.register('gpu')} placeholder="Video" className="p-2 border rounded-md" />
                <input {...form.register('battery')} placeholder="Batería" className="p-2 border rounded-md" />
            </div>
        </div>

        {/* DETALLES ADICIONALES */}
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Box className="w-5 h-5 text-blue-600" /> Detalles Adicionales</h3>
                <button type="button" onClick={addSpecRow} className="text-xs bg-gray-100 px-3 py-1 rounded font-bold hover:bg-gray-200">+ Agregar Fila</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <tbody className="divide-y">
                        {specsList.map((spec, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50">
                                <td className="p-1"><input value={spec.key} onChange={(e) => updateSpecRow(idx, 'key', e.target.value)} className="w-full p-2 font-bold outline-none bg-transparent" placeholder="Característica" /></td>
                                <td className="p-1"><input value={spec.value} onChange={(e) => updateSpecRow(idx, 'value', e.target.value)} className="w-full p-2 outline-none bg-transparent" placeholder="Valor" /></td>
                                <td className="p-1 w-10 text-center"><button type="button" onClick={() => removeSpecRow(idx)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                            </tr>
                        ))}
                        {specsList.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400 text-xs">Sin datos extra. Usa "Importar Datos" arriba.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        {/* VISIBILIDAD */}
        <div className="flex gap-6 border-t pt-6">
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register('featured')} className="w-5 h-5" /> <span className="text-sm font-bold">Destacado</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register('active')} className="w-5 h-5" /> <span className="text-sm font-bold">Activo</span></label>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-white z-10 p-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg font-bold text-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">{loading ? 'Guardando...' : 'Guardar Producto'}</button>
        </div>
      </form>
    </div>
  )
}