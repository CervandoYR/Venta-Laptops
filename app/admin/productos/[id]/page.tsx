import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

interface Props {
  params: { id: string }
}

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <AdminPageHeader 
        title="Editar Producto" 
        subtitle={`Modificando: ${product.name}`}
        backLink="/admin/productos"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ProductForm product={product} />
      </div>
    </div>
  )
}