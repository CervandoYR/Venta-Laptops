'use client'

import { useState } from 'react'
import Image from 'next/image'

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
    if (urlInput) {
      onChange(urlInput)
      setUrlInput('')
    }
  }

  return (
    <div className="mb-4">
      {/* Visualización de las imágenes actuales */}
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>

      {/* Input para agregar nuevas URLs */}
      <div className="flex gap-2">
        <input
          disabled={disabled}
          placeholder="Pega aquí la URL de la imagen (ej: https://imgur.com/...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 border p-2 rounded-md"
        />
        <button 
            onClick={handleAdd}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 text-gray-700"
        >
            Agregar Foto
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Nota: Por ahora usa enlaces directos de internet.
      </p>
    </div>
  )
}