import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      <div className="max-w-2xl">
        <ProfileForm user={session.user} />
      </div>
    </div>
  )
}
