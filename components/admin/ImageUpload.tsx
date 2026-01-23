'use client'

import { useState } from 'react'
import { Trash2, Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (urlInput && urlInput.trim() !== '') {
      onChange(urlInput.trim())
      setUrlInput('')
    }
  }

  // Aseguramos que value sea un array
  const images = Array.isArray(value) ? value : []

  return (
    <div className="space-y-4">
      
      {/* 1. GRID DE IMÁGENES (Ahora más grandes) */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              
              {/* Botón Eliminar (Visible siempre en móvil, hover en PC) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(url)
                }}
                className="absolute top-2 right-2 z-20 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110"
                title="Eliminar imagen"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* FIX: referrerPolicy="no-referrer"
                  Esto evita que sitios como Falabella bloqueen la imagen por hotlinking.
              */}
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-contain p-2" // object-contain para ver toda la laptop sin recortes
                referrerPolicy="no-referrer"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-50');
                        e.currentTarget.parentElement.innerHTML += `
                            <div class="text-center p-2">
                                <span class="text-xs text-red-400 font-bold block">Error</span>
                                <span class="text-[10px] text-gray-400">Imagen privada o rota</span>
                                <button type="button" class="absolute top-2 right-2 z-20 bg-red-500 text-white p-2 rounded-full" onclick="this.parentElement.parentElement.remove()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                </button>
                            </div>
                        `;
                    }
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. INPUT PARA AGREGAR */}
      <div className="flex gap-2">
        <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="url"
              disabled={disabled}
              placeholder="Pega el link de la imagen aquí..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd(e as any);
                  }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white shadow-sm"
            />
        </div>
        <button 
            type="button"
            onClick={handleAdd}
            disabled={!urlInput || disabled}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold transition shadow-sm whitespace-nowrap"
        >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
        </button>
      </div>
      
      <p className="text-[10px] text-gray-500 mt-2">
        * Usa enlaces que terminen en .jpg, .png o .webp para mejores resultados.
      </p>
    </div>
  )
}