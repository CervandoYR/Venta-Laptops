'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ImageUpload from '@/components/admin/ImageUpload'
import { Loader2, Save, Sparkles, X, LayoutGrid, ChevronDown, Check, ShieldCheck, Tag, Trash2, AlignLeft, Info, AlertCircle } from 'lucide-react'
import { parseDeltronText } from '@/lib/parsers'
import { useToast } from '@/contexts/ToastContext'

// --- CONSTANTES ---
const POPULAR_BRANDS = ['HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Logitech', 'Razer', 'Corsair', 'HyperX', 'Kingston', 'Western Digital', 'Seagate', 'Intel', 'AMD', 'Nvidia', 'Gigabyte', 'Redragon', 'Cougar', 'Epson', 'Canon', 'Xiaomi']

// Categorías base (el usuario puede escribir nuevas)
const CATEGORIES = [
  'Laptops', 'PC Escritorio', 'Monitores', 
  'Componentes', 'Periféricos', 'Audio', 
  'Almacenamiento', 'Impresoras', 'Networking', 'Cables y Accesorios', 'Software'
]

// ✅ UX MEJORADA: Sugerencias para estandarizar la tabla de especificaciones
const COMMON_SPECS = [
  'Procesador', 'RAM', 'Almacenamiento', 'Pantalla', 'Tarjeta de Video', 
  'Batería', 'Sistema Operativo', 'Peso', 'Dimensiones', 'Color', 
  'Puertos', 'Conectividad', 'Teclado', 'Cámara'
]

const WARRANTY_MONTHS = [0, 3, 6, 12, 18, 24, 36]

const slugify = (text: string) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es muy corto'),
  slug: z.string().min(3, 'El enlace (slug) es obligatorio'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Precio inválido'),
  originalPrice: z.number().optional().nullable(),
  stock: z.number().min(0, 'Stock inválido'),
  warrantyMonths: z.number().min(0).default(0),
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

  // Dropdowns States
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandWrapperRef = useRef<HTMLDivElement>(null)
  
  const [showWarrantyDropdown, setShowWarrantyDropdown] = useState(false)
  const warrantyWrapperRef = useRef<HTMLDivElement>(null)

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const categoryWrapperRef = useRef<HTMLDivElement>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { ...product, price: Number(product.price), originalPrice: product.originalPrice ? Number(product.originalPrice) : null, warrantyMonths: product.warrantyMonths || 0 }
      : { slug: '', featured: false, active: true, stock: 0, category: 'Laptops', warrantyMonths: 0, condition: 'NEW', images: [], originalPrice: null, specifications: {}, description: '' }
  })

  // Cierre de dropdowns al hacer click fuera (UX Standard)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandWrapperRef.current && !brandWrapperRef.current.contains(event.target as Node)) setShowBrandDropdown(false)
      if (warrantyWrapperRef.current && !warrantyWrapperRef.current.contains(event.target as Node)) setShowWarrantyDropdown(false)
      if (categoryWrapperRef.current && !categoryWrapperRef.current.contains(event.target as Node)) setShowCategoryDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sincronizar Specs al cargar producto
  useEffect(() => {
    if (product?.specifications && specsList.length === 0) {
      setSpecsList(Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) })))
    }
  }, [product])

  // Actualizar form cuando specsList cambia
  useEffect(() => {
    const specsObject: Record<string, string> = {}
    specsList.forEach(item => { if(item.key && item.value) specsObject[item.key] = item.value })
    form.setValue('specifications', specsObject)
  }, [specsList])

  const handleSmartImport = () => {
    if (!pasteContent) return
    const parsed = parseDeltronText(pasteContent)
    
    if (parsed.brand) form.setValue('brand', parsed.brand)
    if (parsed.model) form.setValue('model', parsed.model)
    if (parsed.category) form.setValue('category', parsed.category)
    if (parsed.warrantyMonths) form.setValue('warrantyMonths', parsed.warrantyMonths)
    
    if (parsed.cpu) form.setValue('cpu', parsed.cpu)
    if (parsed.ram) form.setValue('ram', parsed.ram)
    if (parsed.storage) form.setValue('storage', parsed.storage)
    if (parsed.display) form.setValue('display', parsed.display)
    if (parsed.gpu) form.setValue('gpu', parsed.gpu)

    const newSpecs = Object.entries(parsed.specs).map(([key, value]) => ({ key, value }))
    const currentKeys = specsList.map(s => s.key)
    const filteredNewSpecs = newSpecs.filter(s => !currentKeys.includes(s.key))
    setSpecsList(prev => [...prev, ...filteredNewSpecs])

    if (!form.getValues('name')) form.setValue('name', `${parsed.brand} ${parsed.model} ${parsed.cpu || ''}`.trim())
    if (!form.getValues('description')) form.setValue('description', parsed.description)

    setShowImporter(false)
    setPasteContent('')
  }

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
  
  // Filtros de búsqueda para dropdowns
  const filteredBrands = POPULAR_BRANDS.filter(b => b.toLowerCase().includes(form.watch('brand')?.toLowerCase() || ''))
  const filteredWarranties = WARRANTY_MONTHS.filter(m => String(m).includes(String(form.watch('warrantyMonths'))))
  const categoryInput = form.watch('category') || ''
  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))

  return (
    <div className="relative">
      
      {/* MODAL IMPORTADOR IA */}
      {showImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> Importador Inteligente</h3>
                    <button onClick={() => setShowImporter(false)}><X className="w-5 h-5 text-gray-500 hover:text-red-500 transition" /></button>
                </div>
                <div className="p-4 bg-gray-50">
                    <textarea className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Pega aquí las especificaciones del proveedor (Deltron, etc.)..." value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} />
                </div>
                <div className="p-5 border-t bg-white flex justify-end gap-3">
                    <button onClick={handleSmartImport} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Procesar Datos</button>
                </div>
            </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <p className="text-sm text-gray-500">Completa la información para publicar en la tienda.</p>
            </div>
            <button type="button" onClick={() => setShowImporter(true)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-100"><Sparkles className="w-4 h-4" /> Importar con IA</button>
        </div>

        {/* SECCIÓN 1: IMÁGENES */}
        <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">Galería de Imágenes <span className="text-red-500">*</span></label>
            <ImageUpload value={currentImages} onChange={(url) => form.setValue('images', [...currentImages, url], { shouldValidate: true })} onRemove={(url) => form.setValue('images', currentImages.filter(i => i !== url))} />
            {form.formState.errors.images && <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {form.formState.errors.images.message}</p>}
        </div>

        {/* SECCIÓN 2: IDENTIDAD DEL PRODUCTO */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Nombre del Producto <span className="text-red-500">*</span></label>
                <input {...form.register('name')} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Ej: Laptop Asus TUF Gaming F15..." />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Slug (URL Amigable)</label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg select-none">/productos/</span>
                    <input {...form.register('slug')} className="w-full p-2.5 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none" readOnly />
                </div>
            </div>
        </div>

        {/* SECCIÓN 3: DESCRIPCIÓN CON INDICACIÓN HTML */}
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Descripción Detallada</label>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Soporta HTML</span>
            </div>
            <textarea 
              {...form.register('description')} 
              rows={5} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y font-normal text-sm" 
              placeholder="Escribe aquí los detalles... Puedes usar <b>negrita</b>, <ul>listas</ul>, etc."
            />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Tip: Puedes pegar texto normal con formato o escribir código HTML básico para mejorar la presentación.
            </p>
        </div>

        {/* SECCIÓN 4: DATOS COMERCIALES */}
        <div className="grid md:grid-cols-4 gap-6 bg-blue-50/30 p-5 rounded-xl border border-blue-100">
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Precio (S/) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} className="w-full p-2 border border-blue-200 rounded-md font-bold text-lg text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                {form.formState.errors.price && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Precio Lista (Antes)</label>
                <input type="number" step="0.01" {...form.register('originalPrice', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md text-gray-500 text-sm" placeholder="Opcional" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Stock <span className="text-red-500">*</span></label>
                <input type="number" {...form.register('stock', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            {/* COMBOBOX GARANTÍA */}
            <div className="relative" ref={warrantyWrapperRef}>
                <label className="block text-sm font-bold mb-1 flex items-center gap-1 text-gray-700"><ShieldCheck className="w-4 h-4 text-blue-600" /> Garantía (Meses)</label>
                <div className="relative">
                    <input type="number" {...form.register('warrantyMonths', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md pr-10 bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" onFocus={() => setShowWarrantyDropdown(true)} />
                    <button type="button" onClick={() => setShowWarrantyDropdown(!showWarrantyDropdown)} className="absolute right-2 top-2.5"><ChevronDown className="w-4 h-4 text-gray-400" /></button>
                </div>
                {showWarrantyDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {filteredWarranties.map(m => (
                            <button key={m} type="button" onClick={() => { form.setValue('warrantyMonths', m); setShowWarrantyDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">
                                {m === 0 ? '0 (Sin garantía)' : `${m} meses`}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* SECCIÓN 5: CLASIFICACIÓN (CATEGORÍA HÍBRIDA) */}
        <div className="grid md:grid-cols-4 gap-6">
            
            {/* ✅ CATEGORÍA: SELECTOR O TEXTO LIBRE */}
            <div className="relative" ref={categoryWrapperRef}>
                <label className="block text-sm font-bold mb-1 flex items-center gap-1 text-gray-700"><Tag className="w-3.5 h-3.5" /> Categoría</label>
                <div className="relative">
                    <input 
                      {...form.register('category')} 
                      className="w-full p-2 border border-gray-300 rounded-md pr-8 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="Selecciona o escribe..." 
                      onFocus={() => setShowCategoryDropdown(true)} 
                      autoComplete="off"
                    />
                    <button type="button" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} className="absolute right-2 top-2.5">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                {showCategoryDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {filteredCategories.map(c => (
                            <button key={c} type="button" onClick={() => { form.setValue('category', c); setShowCategoryDropdown(false); }} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex justify-between items-center group transition-colors">
                                {c} {categoryInput === c && <Check className="w-3 h-3 text-blue-600" />}
                            </button>
                        ))}
                        {filteredCategories.length === 0 && <div className="p-3 text-xs text-gray-500 text-center bg-gray-50 border-t">Crear nueva: <span className="font-bold">"{categoryInput}"</span></div>}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Condición</label>
                <select {...form.register('condition')} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="NEW">Nuevo (Sellado)</option>
                    <option value="LIKE_NEW">Open Box</option>
                    <option value="USED">Usado</option>
                </select>
            </div>

            <div className="relative" ref={brandWrapperRef}>
                <label className="block text-sm font-bold mb-1 text-gray-700">Marca <span className="text-red-500">*</span></label>
                <input {...form.register('brand')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" onFocus={() => setShowBrandDropdown(true)} autoComplete="off" />
                {showBrandDropdown && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {filteredBrands.map(b => <button key={b} type="button" onClick={() => { form.setValue('brand', b); setShowBrandDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">{b}</button>)}
                    </div>
                )}
                {form.formState.errors.brand && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>
            
            <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Modelo <span className="text-red-500">*</span></label>
                <input {...form.register('model')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                {form.formState.errors.model && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>
        </div>

        {/* SECCIÓN 6: ESPECIFICACIONES DINÁMICAS (CON AUTOCOMPLETADO) */}
        <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><LayoutGrid className="w-5 h-5 text-blue-600" /> Especificaciones Extra</h3>
                <button type="button" onClick={() => setSpecsList([...specsList, { key: '', value: '' }])} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition border border-blue-200">+ Agregar Fila</button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                        {specsList.map((spec, idx) => (
                            <tr key={idx} className="group">
                                <td className="p-1 w-1/3">
                                    {/* ✅ AUTOCOMPLETADO NATIVO CON DATALIST */}
                                    <input 
                                        list="common-specs" 
                                        value={spec.key} 
                                        onChange={(e) => { const n = [...specsList]; n[idx].key = e.target.value; setSpecsList(n); }} 
                                        className="w-full p-2 font-bold bg-transparent focus:bg-white rounded-md focus:ring-1 focus:ring-blue-400 outline-none transition" 
                                        placeholder="Ej: Procesador" 
                                    />
                                </td>
                                <td className="p-1">
                                    <input 
                                        value={spec.value} 
                                        onChange={(e) => { const n = [...specsList]; n[idx].value = e.target.value; setSpecsList(n); }} 
                                        className="w-full p-2 bg-transparent focus:bg-white rounded-md focus:ring-1 focus:ring-blue-400 outline-none transition" 
                                        placeholder="Valor" 
                                    />
                                </td>
                                <td className="w-10 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))} className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* 💡 ESTE ES EL TRUCO PARA LAS SUGERENCIAS */}
                <datalist id="common-specs">
                    {COMMON_SPECS.map(s => <option key={s} value={s} />)}
                </datalist>

                {specsList.length === 0 && <div className="text-center p-4 text-gray-400 italic text-xs">No hay especificaciones adicionales.</div>}
            </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100 pt-6">
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" {...form.register('featured')} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> <span className="font-bold text-gray-700">Destacado en Inicio</span></label>
                <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" {...form.register('active')} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" /> <span className="font-bold text-gray-700">Producto Activo</span></label>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto">Cancelar</button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </div>
        </div>
      </form>
    </div>
  )
}