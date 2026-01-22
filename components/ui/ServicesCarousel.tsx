'use client'

import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { Network, Server, Shield, Cable, Wifi, Database, Video, Settings } from 'lucide-react'

const services = [
  { icon: Network, title: 'Redes HFC y FTTH', desc: 'Instalación de alta velocidad' },
  { icon: Server, title: 'Cajas NAT', desc: 'Distribución optimizada de red' },
  { icon: Cable, title: 'Fibra Óptica', desc: 'Empalmes y fusión de precisión' },
  { icon: Wifi, title: 'Networking', desc: 'Diseño de infraestructuras' },
  { icon: Video, title: 'Videovigilancia', desc: 'Sistemas de cámaras IP/CCTV' },
  { icon: Database, title: 'Data Center', desc: 'Gestión y almacenamiento' },
  { icon: Shield, title: 'Ciberseguridad', desc: 'Protección de activos digitales' },
  { icon: Settings, title: 'Soporte TI', desc: 'Mantenimiento corporativo' },
]

export function ServicesCarousel() {
  // 💡 TRUCO UX: Duplicamos la lista para asegurar el loop infinito perfecto en pantallas grandes
  const infiniteServices = [...services, ...services]

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,       // Activa el bucle infinito (a b c d -> a b c d)
      dragFree: true,   // Movimiento fluido tipo "cinta", no salta de uno en uno
      align: 'start',
      containScroll: false // Importante para que el scroll fluya libremente
    }, 
    [
      AutoScroll({ 
        speed: 1,                 // Velocidad suave (1 es elegante, 2 es rápido)
        stopOnInteraction: false, // Si el usuario toca, sigue moviéndose al soltar
        stopOnMouseEnter: true,   // ✅ Se detiene al pasar el mouse (para leer)
        playOnInit: true
      })
    ]
  )

  return (
    <div className="w-full py-16 bg-gray-50 border-y border-gray-100 overflow-hidden">
      
      {/* Título */}
      <div className="container mx-auto px-4 mb-10 text-center">
        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-2">
          Nuestra Experiencia en Campo
        </h3>
        <p className="text-gray-500 max-w-2xl mx-auto">
          La ingeniería que respalda cada equipo que vendemos.
          <span className="text-xs text-blue-400 block mt-1 animate-pulse">(Nuestros servicios)</span>
        </p>
      </div>

      {/* Contenedor del Carrusel */}
      {/* cursor-grab indica que es interactivo */}
      <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
        
        {/* Usamos 'flex' sin 'gap' en el padre, y usamos 'padding' en los hijos.
            Esto evita saltos visuales en la unión del bucle infinito. */}
        <div className="flex touch-pan-y">
          
          {infiniteServices.map((service, index) => (
            // flex-[0_0_auto] evita que se estiren o encojan
            <div key={index} className="flex-[0_0_300px] min-w-0 px-4">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center group">
                
                {/* Icono */}
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
                  <service.icon className="w-8 h-8" />
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                  {service.title}
                </h4>
                
                <p className="text-sm text-gray-500 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}