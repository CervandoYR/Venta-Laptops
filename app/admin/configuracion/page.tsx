'use client'

import { useState, useEffect } from 'react'
import ImageUpload from '@/components/admin/ImageUpload'
import { useRouter } from 'next/navigation'

export default function ConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroText: '',
    heroImage: '',
    carouselImages: [] as string[] // Array para el carrusel
  })

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        if(data) setFormData({
            ...data,
            // Aseguramos que sea array por si viene null
            carouselImages: data.carouselImages || []
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Error al guardar')
      
      alert('¡Configuración guardada!')
      router.refresh()
      router.push('/')
    } catch (error) {
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Helpers para manejar las imágenes del carrusel
  const addCarouselImage = (url: string) => {
    setFormData(prev => ({ 
        ...prev, 
        carouselImages: [...prev.carouselImages, url] 
    }))
  }
  
  const removeCarouselImage = (urlToRemove: string) => {
    setFormData(prev => ({ 
        ...prev, 
        carouselImages: prev.carouselImages.filter(url => url !== urlToRemove) 
    }))
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 border-b pb-4 text-gray-800">
            Editar Portada de Inicio
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SECCIÓN 1: TEXTOS Y FONDO */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-blue-700 flex items-center">
               1. Configuración Principal (Fondo)
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Imagen de Fondo (Opcional)</label>
                    <ImageUpload 
                        value={formData.heroImage ? [formData.heroImage] : []}
                        onChange={(url) => setFormData({...formData, heroImage: url})}
                        onRemove={() => setFormData({...formData, heroImage: ''})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Aparecerá detrás del texto como marca de agua.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título Principal</label>
                    <input 
                        type="text" 
                        value={formData.heroTitle}
                        onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Texto Secundario</label>
                    <textarea 
                        rows={2}
                        value={formData.heroText}
                        onChange={(e) => setFormData({...formData, heroText: e.target.value})}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
          </section>

          {/* SECCIÓN 2: CARRUSEL */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-purple-700 flex items-center">
               2. Imágenes del Carrusel (Lado Derecho)
            </h2>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-4 font-medium">
                    Agrega aquí las imágenes que rotarán automáticamente en el recuadro derecho.
                </p>
                <ImageUpload 
                    value={formData.carouselImages}
                    onChange={addCarouselImage}
                    onRemove={removeCarouselImage}
                />
            </div>
          </section>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            {saving ? 'Guardando cambios...' : 'Guardar y Publicar'}
          </button>
        </form>
      </div>
    </div>
  )
}