import Image from 'next/image'
import Link from 'next/link'
import { Target, Users, Heart } from 'lucide-react'
import { ServicesCarousel } from '@/components/ui/ServicesCarousel' // Importamos el nuevo componente

export const metadata = {
  title: 'Nosotros | Netsystems',
  description: 'Conoce a los expertos detrás de tu próxima laptop.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[450px] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
          alt="Equipo Netsystems"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <span className="text-blue-400 font-bold tracking-wider uppercase text-sm mb-4 block">
            Desde Chancay para todo el Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Innovación y Calidad en <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Cada Servicio
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Somos especialistas en Redes, Telecomunicaciones e Informática. 
            Esa experiencia técnica es la garantía de que compras el mejor hardware.
          </p>
        </div>
      </div>

      {/* 2. HISTORIA & CREDIBILIDAD */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Texto */}
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Sobre <span className="text-blue-600">NetSystems</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Nuestro compromiso es brindar soluciones tecnológicas confiables y de alta calidad. 
                  Trabajamos con <strong>cableado estructurado</strong> (UTP, coaxial y fibra óptica), adaptándonos a las 
                  necesidades específicas de nuestros clientes con enlaces aéreos o cableados.
                </p>
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 italic text-blue-800">
                  "No somos vendedores de caja. Somos ingenieros que entienden lo que hay dentro de la caja."
                </div>
                <p>
                  Esta trayectoria en <strong>infraestructura crítica</strong> nos da una ventaja única al vender laptops: 
                  sabemos qué equipos soportan la carga real de trabajo, cuáles tienen mejores antenas WiFi y cuáles duran más.
                </p>
              </div>
            </div>
            
            {/* Imagen Corporativa */}
            <div className="order-1 md:order-2 relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500">
                <Image 
                    src="https://img.freepik.com/fotos-premium/persona-que-resuelve-problema-informatico-herramientas-software-diagnostico4_995578-48244.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="Técnico trabajando"
                    fill
                    className="object-cover"
                />
                {/* Badge flotante */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-xs">
                    <p className="font-bold text-gray-900">Soluciones TI Integrales</p>
                    <p className="text-xs text-gray-500">Optimizamos procesos empresariales con tecnología de punta.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CARRUSEL DE SERVICIOS (INTERACTIVO) */}
      {/* Esto reemplaza la lista estática larga. Da movimiento y modernidad. */}
      <ServicesCarousel />

      {/* 4. MISIÓN, VISIÓN, VALORES */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Nuestros Pilares</h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Misión */}
                <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Target className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Misión</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Conectar a personas y empresas peruanas con soluciones innovadoras en redes y telecomunicaciones, garantizando calidad y seguridad.
                    </p>
                </div>

                {/* Visión */}
                <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Visión</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Ser líderes en telecomunicaciones en la región, ofreciendo tecnología de vanguardia y un servicio excepcional a nuestros clientes.
                    </p>
                </div>

                {/* Valores */}
                <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Heart className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Valores</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Compromiso, innovación y excelencia son nuestros pilares para construir relaciones de confianza duraderas.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <Image src="/pattern.svg" alt="" fill className="object-cover" /> {/* Fallback pattern */}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tecnología Avanzada para tu Hogar o Negocio
            </h2>
            <p className="text-blue-200 mb-10 text-lg max-w-2xl mx-auto">
                Ya sea una laptop de alto rendimiento o una red de fibra óptica completa, tenemos la solución.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contacto" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg hover:shadow-blue-600/30">
                    Contáctanos
                </Link>
                <Link href="/productos" className="bg-transparent border border-gray-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition">
                    Ver Laptops
                </Link>
            </div>
        </div>
      </section>

    </div>
  )
}