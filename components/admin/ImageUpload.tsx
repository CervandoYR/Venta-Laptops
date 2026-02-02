'use client'

import { useState } from 'react'
import { Trash2, Plus, Image as ImageIcon, Link as LinkIcon, UploadCloud, AlertCircle } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState('')

  // Agregar por URL manual
  const handleUrlAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (urlInput && urlInput.trim() !== '') {
      onChange(urlInput.trim())
      setUrlInput('')
    }
  }

  // ✅ CORRECCIÓN: Esta función ahora se conecta a onSuccess
  const onUploadSuccess = (result: any) => {
    // Verificamos que secure_url exista en el resultado
    if (result.info && result.info.secure_url) {
      onChange(result.info.secure_url)
    }
  }

  const images = Array.isArray(value) ? value : []

  return (
    <div className="space-y-5">
      
      {/* GRID DE IMÁGENES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove(url)
              }}
              className="absolute top-2 right-2 z-50 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Eliminar imagen"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <ImageItem url={url} />
          </div>
        ))}
        
        {/* ✅ BOTÓN DE SUBIDA CORREGIDO */}
        <CldUploadWidget 
            onSuccess={onUploadSuccess} // 👈 CAMBIO IMPORTANTE: onSuccess en lugar de onUpload
            uploadPreset="venta-laptops" 
            options={{ 
                maxFiles: 1,
                resourceType: "image",
                clientAllowedFormats: ["png", "jpeg", "jpg", "webp"]
            }}
        >
            {({ open }) => {
                return (
                    <button
                        type="button"
                        onClick={() => open?.()}
                        disabled={disabled}
                        className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all gap-2"
                    >
                        <UploadCloud className="w-8 h-8" />
                        <span className="text-xs font-bold">Subir desde PC</span>
                    </button>
                )
            }}
        </CldUploadWidget>
      </div>

      {/* INPUT MANUAL */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <label className="text-xs font-bold text-gray-500 mb-2 block">O pega un enlace directo:</label>
        <div className="flex gap-2 items-center">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-4 w-4 text-gray-400" /></div>
                <input type="url" disabled={disabled} placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlAdd(e as any); } }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" />
            </div>
            <button type="button" onClick={handleUrlAdd} disabled={!urlInput || disabled} className="bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-bold text-sm transition"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}

function ImageItem({ url }: { url: string }) {
    const [error, setError] = useState(false)
    if (error) {
        return <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-2 text-center"><AlertCircle className="w-6 h-6 mb-1 text-red-400" /><span className="text-[10px] font-medium text-gray-500 break-all line-clamp-2">Error enlace</span></div>
    }
    return <img src={url} alt="" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" onError={() => setError(true)} />
}