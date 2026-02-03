import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      // ✅ UX FIX: Quitamos el 'text-blue-600' de aquí para que el color sea dinámico
      icon: <Truck className="w-6 h-6" />, 
      title: "Envío Gratis Lima",
      desc: "En pedidos > S/ 500"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Garantía Real",
      desc: "12 meses asegurados"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Pago Seguro",
      desc: "Yape, Plin o Efectivo"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Soporte Técnico",
      desc: "Asesoría post-venta"
    }
  ]

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        
        {/* CAJA PRINCIPAL: Bordes redondeados y Sombra Flotante */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          
          {/* Decoración de fondo sutil */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:divide-x divide-gray-100 relative z-10">
            {benefits.map((item, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center md:flex-row md:text-left gap-4 px-2 group cursor-default"
              >
                {/* ✅ UX FIX: El contenedor ahora controla el color. 
                    Normal = text-blue-600. En Hover = text-white. */}
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                   {item.icon}
                </div>
                
                {/* Textos */}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">
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