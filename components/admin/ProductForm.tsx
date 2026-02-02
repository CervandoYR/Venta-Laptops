'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ImageUpload from '@/components/admin/ImageUpload'
import { Loader2, Save, Sparkles, X, ClipboardPaste, Plus, Trash2, LayoutGrid, DollarSign, Box, Image as ImageIcon } from 'lucide-react'
import { parseDeltronText } from '@/lib/parsers'
import { useToast } from '@/contexts/ToastContext'

const slugify = (text: string) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')

const productSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  slug: z.string().min(3, 'Slug requerido'),
  description: z.string().min(10, 'Descripción muy corta'),
  price: z.number().min(0.01, 'Precio inválido'),
  originalPrice: z.number().optional().nullable(),
  stock: z.number().min(0, 'Stock inválido'),
  images: z.array(z.string()).min(1, 'Sube al menos una imagen'),
  category: z.string().default('Laptops'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED']).default('NEW'),
  conditionDetails: z.string().optional(),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
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
  
  const [showImporter, setShowImporter] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([])

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
          images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
          specifications: product.specifications || {}
        }
      : {
          slug: '', featured: false, active: true, stock: 0, category: 'Laptops', condition: 'NEW', images: [], originalPrice: null, specifications: {}
        }
  })

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

  const nameValue = form.watch('name')
  useEffect(() => {
    if (nameValue && !product && !form.watch('slug')) {
      form.setValue('slug', slugify(nameValue))
    }
  }, [nameValue, product, form])

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

  return (
    <div className="relative">
      
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
        
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <button type="button" onClick={() => setShowImporter(true)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100"><Sparkles className="w-4 h-4" /> Importar Datos</button>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Galería de Imágenes *</label>
            <ImageUpload 
                value={currentImages} 
                onChange={(url) => form.setValue('images', [...currentImages, url], { shouldValidate: true })} 
                onRemove={(url) => form.setValue('images', currentImages.filter(i => i !== url), { shouldValidate: true })} 
            />
            {form.formState.errors.images && <p className="text-red-600 text-sm mt-1">{form.formState.errors.images.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-1">Nombre *</label><input {...form.register('name')} className="w-full p-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input {...form.register('slug')} className="w-full p-2 border rounded-md bg-gray-50" /></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div><label className="block text-sm font-bold text-gray-800 mb-1">Precio Venta (S/) *</label><input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} className="w-full p-2 border rounded-md font-bold text-lg" /></div>
            <div><label className="block text-sm font-bold text-blue-800 mb-1">Precio Lista (Antes)</label><input type="number" step="0.01" {...form.register('originalPrice', { valueAsNumber: true })} className="w-full p-2 border border-blue-200 rounded-md bg-white text-gray-500" placeholder="Opcional" /></div>
            <div><label className="block text-sm font-medium mb-1">Stock *</label><input type="number" {...form.register('stock', { valueAsNumber: true })} className="w-full p-2 border rounded-md" /></div>
        </div>

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
                    <option value="REFURBISHED">Reacondicionado</option> {/* ✅ AGREGADO */}
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Descripción (HTML) *</label>
            <textarea {...form.register('description')} rows={4} className="w-full p-2 border rounded-md" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-1">Marca *</label><input {...form.register('brand')} className="w-full p-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium mb-1">Modelo *</label><input {...form.register('model')} className="w-full p-2 border rounded-md" /></div>
        </div>

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