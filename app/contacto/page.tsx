'use client'

import { useState } from 'react'
import { Mail, MapPin, MessageCircle, Clock, Send, Loader2, CheckCircle, ArrowRight, Package, ShoppingBag, HelpCircle, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: 'consulta',
    orderId: '',
    message: ''
  })

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const contactReasons = [
    { id: 'consulta', label: 'Consulta sobre un producto' },
    { id: 'pedido', label: 'Estado de mi Pedido' },
    { id: 'garantia', label: 'Garantía o Soporte Técnico' },
    { id: 'cotizacion', label: 'Cotización para Empresas' },
    { id: 'otro', label: 'Otros temas' }
  ]

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
      
      if (res.ok) {
        setSent(true)
        setFormData({ name: '', email: '', phone: '', reason: 'consulta', orderId: '', message: '' })
      } else {
        alert('Hubo un error al enviar el mensaje.')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* 1. HERO HEADER */}
      <div className="bg-white border-b border-gray-100 pb-16 pt-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Hablemos de Tecnología
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          ¿Necesitas asesoría técnica o una cotización formal? 
          Somos una empresa 100% operativa lista para atenderte.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-8">
        
        {/* 2. TARJETAS DE CONTACTO */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 relative z-10">
          
          {/* WhatsApp */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Atención Comercial</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Respuesta inmediata. Ideal para consultas rápidas y ventas.
            </p>
            <a href="https://wa.me/51926870309" target="_blank" className="mt-auto w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
              Chatear Ahora <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Email */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Área Corporativa</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Para cotizaciones formales, licitaciones y proveedores.
            </p>
            <a href="mailto:servitektechnologies@gmail.com" className="mt-auto w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition text-sm break-all px-2">
              servitektechnologies@gmail.com
            </a>
          </div>

          {/* Ubicación */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Oficina Administrativa</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Punto de despacho y trámites documentarios. 
              <span className="block text-purple-600 font-semibold mt-1">Atención Previa Coordinación</span>
            </p>
            <div className="mt-auto w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-medium text-sm">
              Juan Castilla 656, SJM - Lima
            </div>
          </div>
        </div>

        {/* 3. FORMULARIO + MAPA */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          
          {/* FORMULARIO AVANZADO */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 h-fit">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Déjanos un mensaje</h2>
              <p className="text-gray-500 mt-2">
                Completa el formulario y el área correspondiente te responderá.
              </p>
            </div>

            {sent ? (
              <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100 animate-fade-in py-16">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">¡Mensaje Enviado!</h3>
                <p className="text-green-700">Gracias por contactarnos. Nos pondremos en contacto contigo pronto.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-green-700 font-bold hover:underline">Nuevo mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nombre y Celular */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white'}`}
                        placeholder="Tu nombre" />
                    {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Celular</label>
                    <input type="tel" name="phone" maxLength={9} value={formData.phone} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white'}`}
                        placeholder="999 999 999" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.phone}</p>}
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correo</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="tu@correo.com" />
                </div>

                {/* Selector de Motivo */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">¿En qué podemos ayudarte?</label>
                    <div className="relative">
                        <select name="reason" value={formData.reason} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                            {contactReasons.map(r => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Campo condicional: ID Pedido */}
                {showOrderField && (
                    <div className="animate-fade-in bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Número de Pedido (Opcional)
                        </label>
                        <input type="text" name="orderId" value={formData.orderId} onChange={handleChange}
                            className="w-full p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="Ej: #A1B2C3" />
                        <p className="text-xs text-blue-600 mt-1">Lo encuentras en tu correo de confirmación.</p>
                    </div>
                )}

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detalle</label>
                  <textarea name="message" required rows={4} value={formData.message} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                    placeholder={
                        formData.reason === 'cotizacion' ? "Hola, quisiera cotizar 5 laptops para..." :
                        formData.reason === 'garantia' ? "Hola, mi equipo presenta una falla en..." :
                        "Escribe aquí tu consulta..."
                    }></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Send className="w-5 h-5" /> Enviar Mensaje</>}
                </button>
              </form>
            )}
          </div>

          {/* MAPA & HORARIO */}
          <div className="space-y-8">
            
            {/* Mapa */}
            <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100 h-[300px] md:h-[400px] relative overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.353653064916!2d-76.97087808902369!3d-12.156308888039428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b859395a528f%3A0x8e802c4842d67958!2sJuan%20Castilla%20656%2C%20lima%201!5e0!3m2!1ses!2spe!4v1769101313420!5m2!1ses!2spe" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-md">
                   📍 Centro de Operaciones (Lima)
                </div>
            </div>

            {/* Horario */}
            <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Clock className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                    <Clock className="w-6 h-6 text-blue-300" /> Horario de Atención
                </h3>
                <div className="space-y-3 relative z-10 text-blue-100">
                    <div className="flex justify-between border-b border-blue-800 pb-2">
                        <span>Lunes - Viernes</span>
                        <span className="font-bold text-white">9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-800 pb-2">
                        <span>Sábados</span>
                        <span className="font-bold text-white">9:00 AM - 2:00 PM</span>
                    </div>
                    <p className="text-xs text-blue-300 mt-4 italic">
                        * Atendemos consultas por WhatsApp incluso fuera de horario según disponibilidad.
                    </p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}