import { HardHat } from 'lucide-react'
import TechniciansClient from './TechniciansClient'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TechniciansPage() {
  const technicians = await prisma.technician.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tickets: {
        select: { id: true, status: true }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white hover:bg-gray-100 rounded-full border shadow-sm transition-colors text-gray-600" title="Regresar al panel">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <HardHat className="w-8 h-8 text-orange-600" />
              Equipo de Técnicos
            </h1>
            <p className="text-gray-500 mt-2">Gestiona el personal técnico y visualiza su carga de trabajo</p>
          </div>
        </div>
      </div>

      <TechniciansClient initialTechnicians={technicians} />
    </div>
  )
}
