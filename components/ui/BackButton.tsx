"use client"
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter()
  return (
    <button onClick={() => {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push(fallbackHref)
      }
    }}
      className="p-2 bg-white hover:bg-gray-100 rounded-full border shadow-sm transition-colors text-gray-600">
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
