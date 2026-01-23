'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface UniversalImageProps {
  src: string
  alt: string
  className?: string
}

export default function UniversalImage({ src, alt, className }: UniversalImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 text-gray-300 ${className}`}>
        <ImageOff className="w-1/2 h-1/2" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  )
}