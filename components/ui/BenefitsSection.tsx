import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Truck className="w-5 h-5 md:w-6 md:h-6" />, 
      title: "Envío Gratis Lima",
      desc: "En pedidos desde S/ 500"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Garantía Real",
      desc: "Garantía de fábrica"
    },
    {
      icon: <CreditCard className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Pago Seguro",
      desc: "Yape, Plin o Efectivo"
    },
    {
      icon: <Headphones className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Soporte Técnico",
      desc: "Asesoría post-venta"
    }
  ]

  return (
    // ✅ UX FIX: Padding Asimétrico. 'pt-6 md:pt-8' arriba para separarse del Hero. 
    // 'pb-0 md:pb-2' abajo para que empalme perfectamente con los filtros que siguen.
    <section className="relative z-30 pt-6 pb-0 md:pt-8 md:pb-2">
      <div className="container mx-auto px-4">
        
        {/* CAJA PRINCIPAL */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-4 md:p-8 relative overflow-hidden group">
          
          {/* Decoración de fondo (Solo PC) */}
          <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>

          {/* =========================================
              1. VISTA MÓVIL (Scroll Horizontal Manual con Snap)
          ========================================= */}
          {/* ✅ UX FIX: 'py-1' para que la sombra de la cajita no se corte */}
          <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 py-1">
            {benefits.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 px-4 py-3.5 rounded-2xl flex-shrink-0 w-[85%] snap-center shadow-sm"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                   {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-[13px] leading-tight mb-0.5 truncate">{item.title}</h3>
                  <p className="text-[11px] text-gray-500 font-medium truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* =========================================
              2. VISTA PC (Cuadrícula Estática sin Scroll)
          ========================================= */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 divide-x divide-gray-100 relative z-10">
            {benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 group/item cursor-default">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-300 shadow-sm">
                   {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5 group-hover/item:text-blue-700 transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}