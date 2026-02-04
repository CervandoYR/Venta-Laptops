import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp'
import KiroAssistant from '@/components/ai/KiroAssistant' // ✅ Tu Asistente IA
import AdminFloatingButton from '@/components/admin/AdminFloatingButton' // ✅ Tu Botón Admin Nuevo
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://store.netsystems.net.pe/'),
  title: {
    default: 'Netsystems - Laptops Premium y Gamer en Perú',
    template: '%s | Netsystems',
  },
  description: 'Compra las mejores laptops del mercado en Perú. MacBook, Dell, HP, Lenovo y más. Envío gratis en Lima y garantía oficial.',
  keywords: ['laptops peru', 'venta laptops', 'computadoras gamer', 'MacBook', 'Dell', 'Lenovo'],
  authors: [{ name: 'Netsystems Perú' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://store.netsystems.net.pe/',
    siteName: 'Netsystems',
    title: 'Netsystems - Laptops Premium y Gamer',
    description: 'Especialistas en tecnología de alto rendimiento.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>

            {/* ========================================================
                ZONA DE INTERFAZ FLOTANTE (UI OVERLAY)
            ======================================================== */}
            
            {/* 1. Botón WhatsApp (Derecha Abajo) */}
            <FloatingWhatsApp />

            {/* 2. Asistente Kiro IA (Derecha, encima del WhatsApp) */}
            {/* Nota: Kiro ya tiene su propio posicionamiento dentro del componente */}
            <KiroAssistant />

            {/* 3. Botón Admin (Izquierda Abajo - Solo visible para ti) */}
            <AdminFloatingButton />

          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}