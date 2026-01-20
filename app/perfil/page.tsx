import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Ajusta la ruta si es necesario
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Buscamos al usuario en la DB para tener sus datos más recientes (phone, address)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  // Preparamos los datos seguros para el cliente
  const userData = {
    name: user.name,
    email: user.email,
    address: user.address || '',
    phone: user.phone || ''
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h1>
        <ProfileForm user={userData} />
      </div>
    </div>
  )
}