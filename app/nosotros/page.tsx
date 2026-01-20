import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-blue-900 text-white text-center">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Somos apasionados por la tecnología. Llevamos las mejores laptops y equipos a profesionales de todo el Perú.
          </p>
        </div>
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600')] bg-cover bg-center opacity-20"></div>
      </section>

      {/* Historia y Misión */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Nuestra Historia</h2>
            <p className="text-gray-600 leading-relaxed">
              Fundada en 2024, Netsystems nació con una misión clara: democratizar el acceso a tecnología de alto rendimiento. 
              Empezamos como un pequeño emprendimiento familiar y hoy somos referentes en venta de equipos para programación, diseño y gaming.
            </p>
            <h2 className="text-3xl font-bold text-gray-800 pt-4">Nuestra Misión</h2>
            <p className="text-gray-600 leading-relaxed">
              Brindar asesoría personalizada y equipos de calidad que potencien el talento de nuestros clientes, 
              garantizando siempre precios justos y un soporte post-venta excepcional.
            </p>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
             <Image 
               src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800" 
               alt="Equipo de trabajo" 
               fill 
               className="object-cover"
             />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nuestros Valores</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-xl font-bold mb-2">Honestidad</h3>
                    <p className="text-gray-600">Transparencia total en el estado de nuestros equipos.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold mb-2">Innovación</h3>
                    <p className="text-gray-600">Siempre buscamos lo último en tecnología para ti.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-4xl mb-4">❤️</div>
                    <h3 className="text-xl font-bold mb-2">Pasión</h3>
                    <p className="text-gray-600">Amamos lo que hacemos y eso se nota en nuestro servicio.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  )
}