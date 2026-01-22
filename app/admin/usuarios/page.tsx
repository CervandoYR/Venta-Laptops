import { prisma } from '@/lib/prisma'
import { UsersClient } from './UsersClient' // Lo crearemos abajo
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 1. SERVER COMPONENT: Carga los datos de forma segura
export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  // Obtenemos todos los usuarios ordenados por fecha
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        _count: {
            select: { orders: true } // Contamos sus pedidos para mostrar data útil
        }
    }
  })

  return <UsersClient initialUsers={users} currentUserId={session.user.id} />
}