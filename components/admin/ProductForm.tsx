'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ImageUpload from '@/components/admin/ImageUpload'
import { Loader2, Save, Sparkles, X, ClipboardPaste, Plus, Trash2, LayoutGrid, Box, ChevronDown, Check, ShieldCheck, AlertCircle } from 'lucide-react'
import { parseDeltronText } from '@/lib/parsers'
import { useToast } from '@/contexts/ToastContext'

// --- CONSTANTES ---
const POPULAR_BRANDS = ['HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Logitech', 'Razer', 'Corsair', 'HyperX', 'Kingston', 'Western Digital', 'Seagate', 'Intel', 'AMD', 'Nvidia', 'Gigabyte', 'Redragon', 'Cougar', 'Epson', 'Canon', 'Xiaomi']

// ✅ NUEVAS CATEGORÍAS COMPLETAS
const CATEGORIES = [
  'Laptops', 'PC Escritorio', 'Monitores', 
  'Componentes', 'Periféricos', 'Audio', 
  'Almacenamiento', 'Impresoras', 'Networking', 'Cables y Accesorios', 'Software'
]

// ✅ MESES DE GARANTÍA (OPCIONES)
const WARRANTY_MONTHS = [0, 3, 6, 12, 18, 24, 36]

const slugify = (text: string) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es muy corto'),
  slug: z.string().min(3, 'El enlace (slug) es obligatorio'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Precio inválido'),
  originalPrice: z.number().optional().nullable(),
  stock: z.number().min(0, 'Stock inválido'),
  warrantyMonths: z.number().min(0).default(0), // ✅ Garantía como Número
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen'),
  category: z.string().default('Laptops'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED']).default('NEW'),
  conditionDetails: z.string().optional(),
  brand: z.string().min(1, 'Marca obligatoria'),
  model: z.string().min(1, 'Modelo obligatorio'),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  gpu: z.string().optional(),
  battery: z.string().optional(),
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
  const [showImporter, setShowImporter] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([])

  // Dropdown Marcas
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandWrapperRef = useRef<HTMLDivElement>(null)

  // ✅ Dropdown Garantía
  const [showWarrantyDropdown, setShowWarrantyDropdown] = useState(false)
  const warrantyWrapperRef = useRef<HTMLDivElement>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { ...product, price: Number(product.price), originalPrice: product.originalPrice ? Number(product.originalPrice) : null, warrantyMonths: product.warrantyMonths || 0 }
      : { slug: '', featured: false, active: true, stock: 0, category: 'Laptops', warrantyMonths: 0, condition: 'NEW', images: [], originalPrice: null, specifications: {}, description: '' }
  })

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandWrapperRef.current && !brandWrapperRef.current.contains(event.target as Node)) setShowBrandDropdown(false)
      if (warrantyWrapperRef.current && !warrantyWrapperRef.current.contains(event.target as Node)) setShowWarrantyDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sincronizar Specs JSON
  useEffect(() => {
    if (product?.specifications && specsList.length === 0) {
      setSpecsList(Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) })))
    }
  }, [product])

  useEffect(() => {
    const specsObject: Record<string, string> = {}
    specsList.forEach(item => { if(item.key && item.value) specsObject[item.key] = item.value })
    form.setValue('specifications', specsObject)
  }, [specsList])

  // Importador IA (AHORA MULTI-CATEGORÍA)
  const handleSmartImport = () => {
    if (!pasteContent) return
    const parsed = parseDeltronText(pasteContent)
    
    // Inyectar datos genéricos
    if (parsed.brand) form.setValue('brand', parsed.brand)
    if (parsed.model) form.setValue('model', parsed.model)
    if (parsed.category) form.setValue('category', parsed.category)
    if (parsed.warrantyMonths) form.setValue('warrantyMonths', parsed.warrantyMonths)
    
    // Inyectar Specs Específicas
    if (parsed.cpu) form.setValue('cpu', parsed.cpu)
    if (parsed.ram) form.setValue('ram', parsed.ram)
    if (parsed.storage) form.setValue('storage', parsed.storage)
    if (parsed.display) form.setValue('display', parsed.display)
    if (parsed.gpu) form.setValue('gpu', parsed.gpu)

    // Inyectar Specs Adicionales en la tabla
    const newSpecs = Object.entries(parsed.specs).map(([key, value]) => ({ key, value }))
    const currentKeys = specsList.map(s => s.key)
    const filteredNewSpecs = newSpecs.filter(s => !currentKeys.includes(s.key))
    setSpecsList(prev => [...prev, ...filteredNewSpecs])

    if (!form.getValues('name')) form.setValue('name', `${parsed.brand} ${parsed.model} ${parsed.cpu || ''}`.trim())
    if (!form.getValues('description')) form.setValue('description', parsed.description)

    setShowImporter(false)
    setPasteContent('')
  }

  // Slug en tiempo real
  const nameValue = form.watch('name')
  useEffect(() => {
    if (nameValue && !product) form.setValue('slug', slugify(nameValue))
  }, [nameValue, product, form])

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const payload = { ...data, image: data.images[0] || '' }
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const res = await fetch(url, { method: product ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Error al guardar')
      showAdminToast(product ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      showError(err.message)
    } finally { setLoading(false) }
  }

  const currentImages = form.watch('images') || []
  const filteredBrands = POPULAR_BRANDS.filter(b => b.toLowerCase().includes(form.watch('brand')?.toLowerCase() || ''))
  
  // ✅ Opciones de Garantía Filtradas
  const warrantyInput = form.watch('warrantyMonths')
  const filteredWarranties = WARRANTY_MONTHS.filter(m => String(m).includes(String(warrantyInput)))

  return (
    <div className="relative">
      
      {/* MODAL IMPORTADOR */}
      {showImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden">
                <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> Importador Inteligente</h3>
                    <button onClick={() => setShowImporter(false)}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-4 bg-gray-50">
                    <textarea className="w-full h-64 p-4 border rounded-xl font-mono text-sm" placeholder="Pega aquí las especificaciones del producto (Deltron, Ingram, etc.)... La IA detectará si es Laptop, Componente, Monitor, etc." value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} />
                </div>
                <div className="p-5 border-t bg-white flex justify-end gap-3">
                    <button onClick={handleSmartImport} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Procesar Datos</button>
                </div>
            </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-8">
        
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-bold">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <button type="button" onClick={() => setShowImporter(true)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-bold"><Sparkles className="w-4 h-4" /> Autocompletar con IA</button>
        </div>

        {/* IMÁGENES */}
        <div>
            <label className="block text-sm font-bold mb-2">Galería de Imágenes *</label>
            <ImageUpload value={currentImages} onChange={(url) => form.setValue('images', [...currentImages, url])} onRemove={(url) => form.setValue('images', currentImages.filter(i => i !== url))} />
        </div>

        {/* NOMBRE */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-1">Nombre *</label>
                <input {...form.register('name')} className="w-full p-2.5 border rounded-lg" placeholder="Ej: Mouse Logitech G502..." />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Slug (URL) *</label>
                <input {...form.register('slug')} className="w-full p-2.5 border rounded-lg bg-gray-50" readOnly={!!product} />
            </div>
        </div>

        {/* PRECIOS Y STOCK Y GARANTIA */}
        <div className="grid md:grid-cols-4 gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div><label className="block text-sm font-bold mb-1">Precio (S/) *</label><input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} className="w-full p-2 border rounded-md font-bold text-lg" /></div>
            <div><label className="block text-sm font-bold mb-1">Stock *</label><input type="number" {...form.register('stock', { valueAsNumber: true })} className="w-full p-2 border rounded-md" /></div>
            
            {/* ✅ COMBOBOX DE GARANTÍA */}
            <div className="relative" ref={warrantyWrapperRef}>
                <label className="block text-sm font-bold mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-600" /> Garantía (Meses)</label>
                <div className="relative">
                    <input type="number" {...form.register('warrantyMonths', { valueAsNumber: true })} className="w-full p-2 border rounded-md pr-10 bg-white" placeholder="0 = Sin garantía" onFocus={() => setShowWarrantyDropdown(true)} />
                    <button type="button" onClick={() => setShowWarrantyDropdown(!showWarrantyDropdown)} className="absolute right-2 top-2.5"><ChevronDown className="w-4 h-4 text-gray-400" /></button>
                </div>
                {showWarrantyDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {filteredWarranties.map(m => (
                            <button key={m} type="button" onClick={() => { form.setValue('warrantyMonths', m); setShowWarrantyDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">
                                {m === 0 ? '0 (Sin garantía)' : `${m} meses`} {form.watch('warrantyMonths') === m && <Check className="inline w-3 h-3 text-blue-600 ml-2" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* CATEGORÍA, CONDICIÓN, MARCA Y MODELO */}
        <div className="grid md:grid-cols-4 gap-6">
            <div>
                <label className="block text-sm font-bold mb-1">Categoría</label>
                <select {...form.register('category')} className="w-full p-2 border rounded-md bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Condición</label>
                <select {...form.register('condition')} className="w-full p-2 border rounded-md bg-white">
                    <option value="NEW">Nuevo (Sellado)</option>
                    <option value="LIKE_NEW">Open Box</option>
                    <option value="USED">Usado</option>
                </select>
            </div>
            <div className="relative" ref={brandWrapperRef}>
                <label className="block text-sm font-bold mb-1">Marca *</label>
                <input {...form.register('brand')} className="w-full p-2 border rounded-md" onFocus={() => setShowBrandDropdown(true)} />
                {showBrandDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {filteredBrands.map(b => <button key={b} type="button" onClick={() => { form.setValue('brand', b); setShowBrandDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">{b}</button>)}
                    </div>
                )}
            </div>
            <div><label className="block text-sm font-bold mb-1">Modelo *</label><input {...form.register('model')} className="w-full p-2 border rounded-md" /></div>
        </div>

        {/* ESPECIFICACIONES DINÁMICAS */}
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-600" /> Especificaciones Extra</h3>
                <button type="button" onClick={() => setSpecsList([...specsList, { key: '', value: '' }])} className="text-xs bg-gray-100 px-3 py-1 rounded font-bold">+ Agregar Fila</button>
            </div>
            <table className="w-full text-sm">
                <tbody className="divide-y border rounded-lg">
                    {specsList.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-1"><input value={spec.key} onChange={(e) => { const n = [...specsList]; n[idx].key = e.target.value; setSpecsList(n); }} className="w-full p-2 font-bold bg-transparent" placeholder="Característica (Ej: DPI, RGB...)" /></td>
                            <td className="p-1"><input value={spec.value} onChange={(e) => { const n = [...specsList]; n[idx].value = e.target.value; setSpecsList(n); }} className="w-full p-2 bg-transparent" placeholder="Valor" /></td>
                            <td className="w-10 text-center"><button type="button" onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-red-400" /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* VISIBILIDAD */}
        <div className="flex gap-6 border-t pt-6">
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register('featured')} className="w-5 h-5" /> <span className="font-bold">Destacado</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register('active')} className="w-5 h-5" /> <span className="font-bold">Activo</span></label>
        </div>

        <div className="flex justify-end gap-4 border-t pt-4">
            <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">{loading ? 'Guardando...' : 'Guardar Producto'}</button>
        </div>
      </form>
    </div>
  )
}