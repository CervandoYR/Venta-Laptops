import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Servitek Technologies - Laptops Premium',
    template: '%s | Servitek Technologies',
  },
  description: 'Compra las mejores laptops del mercado. MacBook, Dell, HP, Lenovo y más. Envío gratis y garantía oficial.',
  keywords: ['laptops', 'notebooks', 'computadoras', 'MacBook', 'Dell', 'HP', 'Lenovo'],
  authors: [{ name: 'Servitek Technologies' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://servitek.com',
    siteName: 'Servitek Technologies',
    title: 'Servitek Technologies - Laptops Premium',
    description: 'Compra las mejores laptops del mercado',
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
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
