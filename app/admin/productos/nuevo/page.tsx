import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Nuevo Producto</h1>
      <div className="max-w-4xl">
        <ProductForm />
      </div>
    </div>
  )
}
