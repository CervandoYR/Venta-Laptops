import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// 👇 IMPORTANTE: Mantener las llaves { } si tu archivo providers.tsx usa 'export function'
import { Providers } from './providers' 
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Servitek - Laptops Premium y Gamer en Perú',
    template: '%s | Servitek',
  },
  description: 'Compra las mejores laptops del mercado en Perú. MacBook, Dell, HP, Lenovo y más. Envío gratis en Lima y garantía oficial.',
  keywords: ['laptops peru', 'venta laptops', 'computadoras gamer', 'MacBook', 'Dell', 'Lenovo'],
  authors: [{ name: 'Servitek Technologies' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://servitek.com',
    siteName: 'Servitek',
    title: 'Servitek - Laptops Premium y Gamer',
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
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}