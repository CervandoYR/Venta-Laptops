'use client'

import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'

// DATOS DE TUS CLIENTES
const clients = [
  { name: 'Belltech', logo: '/logos/belltech.png', width: 160 },
  { name: 'El Mirador de Chancay', logo: '/logos/el-mirador.jpg', width: 140 },
  { name: 'Markham College', logo: '/logos/markham.png', width: 150 },
  { name: 'Univ. Nacional de Música', logo: '/logos/unm.jpg', width: 180 },
  { name: 'HP', logo: '/logos/hp.jpg', width: 80 },
  { name: 'Compucare', logo: '/logos/compucare.png', width: 160 },
  { name: 'Dell', logo: '/logos/dell.png', width: 80 },
  { name: 'Asus', logo: '/logos/asus.png', width: 100 },
  { name: 'Lenovo', logo: '/logos/lenovo.png', width: 120 },
  { name: 'Microsoft', logo: '/logos/microsoft.png', width: 130 },
]

export function ClientsCarousel() {
  const infiniteClients = [...clients, ...clients, ...clients]

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      dragFree: true, 
      align: 'center', 
      containScroll: false 
    },
    [
      AutoScroll({ 
        speed: 1, // Un poquito más rápido para que fluya mejor con logos grandes
        stopOnInteraction: false, 
        stopOnMouseEnter: true, 
        playOnInit: true 
      })
    ]
  )

  return (
    <div className="w-full py-20 bg-white border-t border-gray-100 overflow-hidden">
      
      <div className="container mx-auto px-4 mb-12 text-center">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
          Instituciones y Empresas que confían en nosotros
        </h3>
      </div>

      <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="flex touch-pan-y items-center">
          
          {infiniteClients.map((client, index) => (
            // Aumenté el padding horizontal (px-12 md:px-16) para darles aire
            <div key={index} className="flex-[0_0_auto] px-10 md:px-16 group">
              
              {/* Aumenté el contenedor a h-24 (96px) y el ancho base.
                 La imagen ahora permite hasta max-h-20 (80px) de alto.
              */}
              <div className="relative h-24 w-40 md:w-56 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 transform hover:scale-110">
                
                <Image 
                  src={client.logo} 
                  alt={`Logo ${client.name}`}
                  width={client.width} 
                  height={100}
                  // ✨ AQUÍ ESTÁ EL CAMBIO CLAVE: max-h-20 (80px) en lugar de max-h-12 (48px)
                  className="object-contain max-h-16 md:max-h-20 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.remove('grayscale', 'opacity-50');
                    // Mostrar texto de respaldo si falla la imagen
                    const span = e.currentTarget.nextElementSibling;
                    if(span) span.classList.remove('hidden');
                  }}
                />
                
                {/* Texto de respaldo más grande también */}
                <span className="hidden absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xl md:text-2xl text-center leading-tight">
                   {client.name}
                </span>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}