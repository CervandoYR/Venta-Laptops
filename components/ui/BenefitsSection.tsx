import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Truck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      title: "Envío Gratis Lima",
      desc: "Por compras desde S/ 500"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      title: "Garantía Real",
      desc: "Desde 12 meses"
    },
    {
      icon: <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      title: "Pago Seguro",
      desc: "Yape/Efectivo"
    },
    {
      icon: <Headphones className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      title: "Soporte",
      desc: "Asesoría Total"
    }
  ]

  return (
    <section className="bg-white py-6 md:py-8 border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* 👇 AQUÍ ESTÁ EL CAMBIO: grid-cols-2 para móvil */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {benefits.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3 p-3 md:p-4 rounded-xl hover:bg-blue-50 transition-colors border border-gray-50 hover:border-blue-100">
              <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight">{item.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}