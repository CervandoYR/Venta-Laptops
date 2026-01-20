import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Servitek Technologies</h3>
            <p className="text-sm">
              Tu tienda confiable de laptops premium. Calidad, garantía y servicio excepcional.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="hover:text-white transition">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/preguntas-frecuentes" className="hover:text-white transition">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/garantia" className="hover:text-white transition">
                  Política de Garantía
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-white transition">
                  Envíos y Devoluciones
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidad" className="hover:text-white transition">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Servitek Technologies. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
