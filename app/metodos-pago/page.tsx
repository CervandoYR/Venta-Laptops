export default function PaymentMethodsPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Métodos de Pago</h1>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Ofrecemos múltiples opciones seguras para que realices tu compra con total confianza.
        </p>

        <div className="space-y-8">
          
          {/* Tarjetas */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border rounded-xl hover:shadow-md transition-shadow">
            <div className="text-5xl text-blue-600">💳</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tarjetas de Crédito y Débito</h2>
              <p className="text-gray-600 mb-4">
                Aceptamos todas las tarjetas Visa, Mastercard, American Express y Diners Club.
                Tus pagos son procesados de forma segura a través de nuestra pasarela encriptada.
              </p>
              <div className="flex gap-2 opacity-70">
                 {/* Aquí podrías poner íconos de tarjetas */}
                 <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">VISA</span>
                 <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">MASTERCARD</span>
                 <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">AMEX</span>
              </div>
            </div>
          </div>

          {/* Transferencia / Yape */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border rounded-xl hover:shadow-md transition-shadow">
            <div className="text-5xl text-purple-600">📱</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Yape, Plin y Transferencias</h2>
              <p className="text-gray-600 mb-4">
                Puedes pagar directamente a nuestras cuentas bancarias empresariales o usar billeteras digitales.
                Una vez realizado el pago, solo debes enviarnos la constancia por WhatsApp.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• BCP Soles: 29506327177063</li>
                <li>• BCP Soles (Interbancario): 00229510632717706345</li>
                <li>• BBVA Soles: En proceso</li>
                <li>• Yape/Plin: 961 700 562 (Cervando Yactayo YAPE/PLIN)</li>
              </ul>
            </div>
          </div>

          {/* Efectivo */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border rounded-xl hover:shadow-md transition-shadow">
            <div className="text-5xl text-green-600">💵</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pago Contra-Entrega (Solo Lima)</h2>
              <p className="text-gray-600">
                Si te encuentras en Lima Metropolitana, puedes pagar en efectivo o con tarjeta al momento de recibir tu producto.
                Válido para compras de hasta S/ 2,000.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}