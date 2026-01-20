import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Columna 1: Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Servitek</h3>
            <p className="mb-4 text-sm leading-relaxed">
              Tu tienda de confianza para laptops y equipos de alta gama. 
              Tecnología premium al alcance de todos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">TikTok</a>
            </div>
          </div>

          {/* Columna 2: Tienda */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/?category=Laptops" className="hover:text-white transition-colors">Laptops</Link></li>
              <li><Link href="/?category=PC Escritorio" className="hover:text-white transition-colors">PC Escritorio</Link></li>
              <li><Link href="/?category=Monitores" className="hover:text-white transition-colors">Monitores</Link></li>
            </ul>
          </div>

          {/* Columna 3: Ayuda */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Ayuda & Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Conócenos</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contáctanos</Link></li>
              <li><Link href="/metodos-pago" className="hover:text-white transition-colors">Métodos de Pago</Link></li>
              <li><Link href="/pedidos" className="hover:text-white transition-colors">Mis Pedidos</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contáctanos</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                 <span>📍</span> Av. Javier Prado 1234, Lima
              </li>
              <li className="flex items-center gap-2">
                 <span>📱</span> +51 987 654 321
              </li>
              <li className="flex items-center gap-2">
                 <span>✉️</span> ventas@servitek.com
              </li>
            </ul>
          </div>

        </div>

        {/* Sección Legal y Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p className="mb-2">&copy; {new Date().getFullYear()} Servitek Technologies S.R.L. Todos los derechos reservados.</p>
          <p className="text-gray-500 font-semibold tracking-wide">
            RUC: 20603694067 - SERVITEK TECHNOLOGIES S.R.L
          </p>
        </div>
      </div>
    </footer>
  )
}