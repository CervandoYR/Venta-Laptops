# Servitek Technologies - E-commerce de Laptops

Aplicación web de comercio electrónico desarrollada con Next.js 14 para la venta de laptops.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL + Prisma
- **Autenticación**: NextAuth.js
- **Pagos**: Stripe
- **Validación**: Zod + React Hook Form
- **TypeScript**: Para type safety

## 📋 Funcionalidades

### Para Clientes
- ✅ Catálogo de laptops completo
- ✅ Página de detalle de producto con especificaciones
- ✅ Carrito de compras persistente (localStorage + DB)
- ✅ Checkout seguro con Stripe
- ✅ Confirmación de pago
- ✅ Historial de pedidos
- ✅ Perfil de usuario editable

### Para Administradores
- ✅ Dashboard administrativo con estadísticas
- ✅ CRUD completo de productos
- ✅ Gestión de pedidos
- ✅ Cambio de estado de pedidos (Pendiente, Procesando, En Camino, Entregado, Cancelado)
- ✅ Visualización de detalles de pedidos

## 🔧 Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL
- Cuenta de Stripe (modo test)

### Pasos

1. **Clona el repositorio**
```bash
git clone <tu-repo>
cd Venta-Laptops
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:
```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/servitek_db?schema=public"

# NextAuth - Genera un secret aleatorio con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-key-generado"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (modo test)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Solo necesario para producción
```

4. **Configura la base de datos:**
```bash
# Crear la base de datos en PostgreSQL
createdb servitek_db

# Ejecutar migraciones
npx prisma db push

# Poblar con datos de ejemplo
npm run db:seed
```

5. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👤 Cuentas de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

**Administrador:**
- Email: `admin@servitek.com`
- Password: `admin123`

**Cliente:**
- Email: `cliente@servitek.com`
- Password: `user123`

## 📁 Estructura del Proyecto

```
/app
  /api              # API Routes
  /admin            # Panel de administración
  /productos        # Páginas de productos
  /checkout         # Proceso de pago
  /carrito          # Carrito de compras
  /pedidos          # Historial de pedidos
  /perfil           # Perfil de usuario
  /login            # Login
  /registro         # Registro
/components         # Componentes reutilizables
  /admin           # Componentes del panel admin
  /auth            # Componentes de autenticación
  /checkout        # Componentes de checkout
  /layout          # Navbar, Footer
  /products        # Componentes de productos
  /profile         # Componentes de perfil
/lib               # Utilidades y configuraciones
/prisma            # Esquema y seed
/types             # TypeScript types
/contexts          # React contexts (Cart)
```

## 🔐 Roles de Usuario

- **USER**: Cliente estándar con acceso a compras
- **ADMIN**: Administrador con acceso completo al panel

## 🔒 Seguridad

- ✅ Hash de contraseñas con bcrypt
- ✅ Protección de rutas con middleware
- ✅ Validación de formularios con Zod
- ✅ Server Actions para mutaciones
- ✅ Variables de entorno para datos sensibles

## 🔍 SEO

- ✅ Metadata dinámica por página
- ✅ URLs amigables (slugs)
- ✅ HTML semántico
- ✅ Schema.org Product markup
- ✅ Optimización de imágenes con next/image

## 💳 Stripe

Este proyecto usa Stripe en modo test. Para configurar:

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves de API desde el dashboard
3. Configúralas en `.env`
4. Para webhooks en desarrollo, usa Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm start` - Inicia servidor de producción
- `npm run db:push` - Sincroniza esquema con DB
- `npm run db:seed` - Pobla base de datos con datos de ejemplo
- `npm run db:studio` - Abre Prisma Studio

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Asegúrate de tener una base de datos PostgreSQL (ej: Supabase, Neon)
4. Deploy automático en cada push

### Variables de Entorno para Producción

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://tu-dominio.com"
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📝 Notas Importantes

- Las imágenes de productos deben estar en `/public/products` o usar URLs externas
- El carrito se sincroniza automáticamente entre localStorage (usuarios no autenticados) y base de datos (usuarios autenticados)
- Los webhooks de Stripe deben configurarse en producción para procesar pagos correctamente
- Usa siempre HTTPS en producción

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Servitek Technologies.
