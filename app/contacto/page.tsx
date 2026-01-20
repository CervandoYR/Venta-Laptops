export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Contáctanos</h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Información de Contacto */}
          <div className="bg-white p-8 rounded-xl shadow-sm space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Estamos aquí para ayudarte</h2>
            
            <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl">📍</div>
                <div>
                    <h3 className="font-bold text-gray-800">Dirección</h3>
                    <p className="text-gray-600">Av. Javier Prado Este 1234, San Isidro<br/>Lima, Perú</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">📱</div>
                <div>
                    <h3 className="font-bold text-gray-800">WhatsApp / Teléfono</h3>
                    <p className="text-gray-600">+51 987 654 321</p>
                    <p className="text-sm text-gray-500">Lunes a Sábado: 9am - 7pm</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 text-xl">✉️</div>
                <div>
                    <h3 className="font-bold text-gray-800">Correo Electrónico</h3>
                    <p className="text-gray-600">ventas@netsystems.com</p>
                </div>
            </div>
            
            {/* Mapa (Iframe de Google Maps) */}
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden mt-6">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.666987654321!2d-77.036525!3d-12.095525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA1JzQzLjkiUyA3N8KwMDInMTEuNSJX!5e0!3m2!1ses!2spe!4v1634567890123!5m2!1ses!2spe" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                ></iframe>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h2>
            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Juan Pérez" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="juan@gmail.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                    <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Consulta sobre Laptop HP" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                    <textarea rows={4} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Hola, quisiera saber..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Enviar Mensaje
                </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}