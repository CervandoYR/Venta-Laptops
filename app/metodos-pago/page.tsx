'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ShieldCheck, Smartphone, CreditCard, BadgeDollarSign, ArrowRight, Truck } from 'lucide-react'

// Datos de las cuentas
const bankAccounts = [
  {
    id: 'bcp',
    bank: 'BCP',
    type: 'Cuenta Corriente Soles',
    number: '191-12345678-0-01',
    cci: '002-191-0012345678001-50',
    holder: 'NETSYSTEMS PERU S.A.C.',
    color: 'bg-[#002a8d]',
    textColor: 'text-white'
  },
  {
    id: 'interbank',
    bank: 'Interbank',
    type: 'Cuenta de Ahorros Soles',
    number: '200-3001234567',
    cci: '003-200-003001234567-00',
    holder: 'NETSYSTEMS PERU S.A.C.',
    color: 'bg-[#009c3b]',
    textColor: 'text-white'
  },
  {
    id: 'bbva',
    bank: 'BBVA',
    type: 'Cuenta Corriente Soles',
    number: '0011-0123-0100012345',
    cci: '011-123-000100012345-00',
    holder: 'NETSYSTEMS PERU S.A.C.',
    color: 'bg-[#004481]',
    textColor: 'text-white'
  }
]

export default function PaymentMethodsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-white min-h-screen pb-20">

      {/* 1. HERO HEADER */}
      <div className="bg-gray-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Métodos de Pago Seguros
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Trabajamos con las principales entidades financieras del país para tu comodidad y seguridad.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-8">

        {/* 2. PASO A PASO (ACTUALIZADO CON ENVÍO) */}
        {/* Cambiamos a 4 columnas para incluir el envío */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12 grid md:grid-cols-4 gap-8 text-center relative z-10">
          
          {/* Paso 1 */}
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl relative z-10">1</div>
            {/* Línea conectora (solo desktop) */}
            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-50 -z-0"></div>
            
            <h3 className="font-bold text-gray-900">Elige tu Banco</h3>
            <p className="text-sm text-gray-500 mt-2">Selecciona la cuenta y copia el número.</p>
          </div>

          {/* Paso 2 */}
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl relative z-10">2</div>
            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-50 -z-0"></div>
            
            <h3 className="font-bold text-gray-900">Realiza el Pago</h3>
            <p className="text-sm text-gray-500 mt-2">Haz la transferencia por el monto total.</p>
          </div>

          {/* Paso 3 */}
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl relative z-10">3</div>
            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-green-50 -z-0"></div>
            
            <h3 className="font-bold text-gray-900">Confirma</h3>
            <p className="text-sm text-gray-500 mt-2">Envíanos la constancia por WhatsApp.</p>
          </div>

          {/* Paso 4 (NUEVO: ENVÍO) */}
          <div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl animate-bounce">
                <Truck className="w-6 h-6" /> {/* Icono de camión */}
            </div>
            <h3 className="font-bold text-gray-900">Recibe tu Pedido</h3>
            <p className="text-sm text-gray-500 mt-2">
                Coordinamos el envío y recibes tu producto en casa.
            </p>
          </div>

        </div>

        {/* 3. BILLETERAS DIGITALES (YAPE/PLIN) */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Smartphone className="text-purple-600" /> Billeteras Digitales
          </h2>
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-2">Yape & Plin</h3>
              <p className="opacity-90 text-lg mb-6">
                Escanea el código QR o paga al número directo. Aceptamos pagos rápidos sin comisiones.
              </p>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl inline-block">
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Número Celular</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-mono font-bold">926 870 309</span>
                  <button
                    onClick={() => handleCopy('926870309', 'yape')}
                    className="bg-white text-purple-600 p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Copiar número"
                  >
                    {copied === 'yape' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm mt-2">Titular: Cervando Y.</p>
              </div>
            </div>
            
            {/* Simulación de QR */}
            <div className="bg-white p-4 rounded-xl shadow-inner rotate-3 hover:rotate-0 transition-transform duration-300">
               <div className="w-48 h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="text-gray-400 font-bold">CÓDIGO QR</span>
               </div>
            </div>
          </div>
        </div>

        {/* 4. CUENTAS BANCARIAS */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BadgeDollarSign className="text-blue-600" /> Transferencias Bancarias
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`${account.color} ${account.textColor} rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
              >
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard className="w-32 h-32 transform rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold">{account.bank}</h3>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                      {account.type}
                    </span>
                  </div>

                  {/* Número de Cuenta */}
                  <div className="mb-4">
                    <p className="text-xs uppercase opacity-70 mb-1">Número de Cuenta</p>
                    <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg backdrop-blur-sm">
                      <code className="font-mono text-lg flex-1">{account.number}</code>
                      <button
                        onClick={() => handleCopy(account.number, account.id + 'num')}
                        className="p-1.5 hover:bg-white/20 rounded transition"
                      >
                        {copied === account.id + 'num' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CCI */}
                  <div className="mb-6">
                    <p className="text-xs uppercase opacity-70 mb-1">CCI (Interbancario)</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm opacity-90">{account.cci}</code>
                      <button
                        onClick={() => handleCopy(account.cci, account.id + 'cci')}
                        className="p-1 hover:bg-white/20 rounded transition"
                      >
                        {copied === account.id + 'cci' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4 mt-4">
                    <p className="text-xs opacity-70">Titular de la cuenta</p>
                    <p className="font-bold text-sm">{account.holder}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. AVISO DE SEGURIDAD (TRUST BADGE) */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-green-900 text-lg">Tu seguridad es nuestra prioridad</h4>
            <p className="text-green-800 text-sm mt-1">
              Todas nuestras cuentas son <strong>100% verificables y seguras en nuestra empresa SERVITEK TECHNOLOGIES (S.A.C.)</strong>. Nunca te pediremos depositar a cuentas personales de terceros desconocidos. Verifica siempre el titular al número <strong>924076526</strong>
            </p>
          </div>
          <Link
            href="/contacto"
            className="whitespace-nowrap bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30"
          >
            Reportar un problema
          </Link>
        </div>

        {/* 6. CTA PARA FINALIZAR */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">¿Ya realizaste el pago de tu pedido?</p>
          <a
            href="https://wa.me/51924076526?text=Hola,%20ya%20realicé%20el%20pago%20de%20mi%20pedido."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline text-lg"
          >
            Enviar comprobante por WhatsApp <ArrowRight className="w-5 h-5" />
          </a>
        </div>

      </div>
    </div>
  )
}