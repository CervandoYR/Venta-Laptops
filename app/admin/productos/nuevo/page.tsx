import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <AdminPageHeader 
        title="Nuevo Producto" 
        subtitle="Agrega un nuevo item a tu inventario"
        backLink="/admin/productos" // 👈 Botón grande activado
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ProductForm />
      </div>
    </div>
  )
}