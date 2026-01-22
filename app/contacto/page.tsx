'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle, ShoppingBag, HelpCircle } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: 'consulta', // Valor por defecto
    orderId: '',        // Nuevo campo opcional
    message: ''
  })

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Opciones de motivo para Retail
  const contactReasons = [
    { id: 'consulta', label: 'Consulta sobre un producto' },
    { id: 'pedido', label: 'Estado de mi Pedido' },
    { id: 'garantia', label: 'Garantía o Soporte Técnico' },
    { id: 'cotizacion', label: 'Cotización para Empresas' },
    { id: 'otro', label: 'Otros temas' }
  ]

  // Detectar si necesitamos pedir el número de orden
  const showOrderField = formData.reason === 'pedido' || formData.reason === 'garantia'

  const validateField = (name: string, value: string) => {
    let errorMsg = ''
    if (name === 'name') {
      if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(value) && value !== '') {
        errorMsg = 'El nombre solo puede contener letras.'
      }
    }
    if (name === 'phone') {
      if (!/^[0-9]*$/.test(value)) {
        errorMsg = 'Solo números.'
      } else if (value.length > 9) {
        errorMsg = 'Máximo 9 dígitos.'
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'name' || name === 'phone') validateField(name, value)
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones finales
    const newErrors = { name: '', phone: '', email: '' }
    let hasError = false

    if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(formData.name)) {
      newErrors.name = 'Nombre inválido.'; hasError = true
    }
    if (formData.phone && !/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Debe tener 9 dígitos.'; hasError = true
    }

    if (hasError) {
      setErrors(newErrors); return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al enviar')

      setSent(true)
      setFormData({ name: '', email: '', phone: '', reason: 'consulta', orderId: '', message: '' })
      setTimeout(() => setSent(false), 8000)

    } catch (error) {
      alert('Error al enviar. Intenta por WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Contáctanos</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Estamos listos para asesorarte con tu compra o resolver tus dudas técnicas.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* INFO DE CONTACTO (Izquierda) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm space-y-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Canales de Atención</h2>
            
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0"><MapPin className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Tienda Física</h3>
                        <p className="text-gray-600">Juan Castilla 656, San Juan de Miraflores</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">Lunes a Sábado: 10am - 8pm</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600 flex-shrink-0"><Phone className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Central Telefónica / WhatsApp</h3>
                        <p className="text-gray-600 font-medium">924 076 526</p>
                        <p className="text-xs text-gray-500">Soporte post-venta disponible.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 flex-shrink-0"><Mail className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Ventas Corporativas</h3>
                        <p className="text-gray-600 break-all">servitektechnologies@gmail.com</p>
                    </div>
                </div>
            </div>
            
            <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden mt-6 border border-gray-100">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.353653064916!2d-76.97087808902369!3d-12.156308888039428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b859395a528f%3A0x8e802c4842d67958!2sJuan%20Castilla%20656%2C%20lima%201!5e0!3m2!1ses!2spe!4v1769096532573!5m2!1ses!2spe" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
            </div>
          </div>

          {/* FORMULARIO MEJORADO (Derecha) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm h-fit border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Envíanos un mensaje</h2>
            <p className="text-gray-500 mb-6 text-sm">Completa el formulario y el área correspondiente te responderá.</p>
            
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in py-16">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud Recibida!</h3>
                <p className="text-green-700 mb-6">Hemos derivado tu caso a nuestro equipo. Te responderemos al correo proporcionado.</p>
                <button onClick={() => setSent(false)} className="text-sm font-bold text-green-700 hover:underline">Nuevo mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                        className={`w-full p-3 border rounded-xl outline-none transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                        placeholder="Ej: Juan Pérez" />
                    {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="juan@empresa.com" />
                    </div>
                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Celular</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={9}
                            className={`w-full p-3 border rounded-xl outline-none transition ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                            placeholder="999 999 999" />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.phone}</p>}
                    </div>
                </div>

                {/* SELECTOR DE MOTIVO (UX Improvement) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">¿En qué podemos ayudarte?</label>
                    <div className="relative">
                        <select name="reason" value={formData.reason} onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer">
                            {contactReasons.map(r => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* CAMPO CONDICIONAL: ID DE PEDIDO */}
                {showOrderField && (
                    <div className="animate-fade-in-down bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Número de Pedido (Opcional)
                        </label>
                        <input type="text" name="orderId" value={formData.orderId} onChange={handleChange}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="Ej: #A1B2C3" />
                        <p className="text-xs text-blue-600 mt-1">Lo encuentras en tu correo de confirmación.</p>
                    </div>
                )}

                {/* Mensaje */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Detalle de tu consulta</label>
                    <textarea rows={4} name="message" required value={formData.message} onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder={
                            formData.reason === 'cotizacion' ? "Hola, quisiera cotizar 5 laptops modelo X para mi empresa..." :
                            formData.reason === 'garantia' ? "Hola, mi equipo presenta una falla en..." :
                            "Escribe aquí tu consulta..."
                        }></textarea>
                </div>

                <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</> : <><Send className="w-5 h-5" /> Enviar Solicitud</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}