import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  backLink?: string
  actionLink?: string
  actionLabel?: string
}

export default function AdminPageHeader({ 
  title, 
  subtitle, 
  backLink, 
  actionLink, 
  actionLabel 
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 pb-6">
      <div className="flex flex-col gap-3">
        {/* BOTÓN ATRÁS MEJORADO (UX: Grande, visible y fácil de cliquear) */}
        {backLink && (
          <Link 
            href={backLink} 
            className="self-start inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm hover:shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Regresar</span>
          </Link>
        )}
        
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1 text-base">{subtitle}</p>}
        </div>
      </div>

      {actionLink && actionLabel && (
        <Link 
          href={actionLink} 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> {actionLabel}
        </Link>
      )}
    </div>
  )
}