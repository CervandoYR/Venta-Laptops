# 🚀 Guía de Inicio Rápido

## ⚡ Pasos para ejecutar el proyecto

### 1️⃣ Instalar dependencias (si no lo has hecho)
```bash
npm install
```

### 2️⃣ Configurar Base de Datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y corriendo. Luego:

```bash
# Crear la base de datos (opcional, Prisma puede crearla)
createdb servitek_db

# O desde PostgreSQL:
# CREATE DATABASE servitek_db;
```

### 3️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de Datos
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/servitek_db?schema=public"

# NextAuth - Genera un secret aleatorio
# En Windows PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# En Linux/Mac: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-aleatorio-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (modo test - opcional para empezar)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**⚠️ IMPORTANTE:** Para generar el NEXTAUTH_SECRET en Windows PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 4️⃣ Configurar la Base de Datos

```bash
# Sincronizar el esquema con la base de datos
npx prisma db push

# Poblar con datos de ejemplo (usuarios y productos)
npm run db:seed
```

### 5️⃣ Iniciar el Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👤 Cuentas de Prueba

Después de ejecutar el seed, puedes usar:

**Administrador:**
- Email: `admin@servitek.com`
- Password: `admin123`

**Cliente:**
- Email: `cliente@servitek.com`
- Password: `user123`

## 🔍 Qué Probar

### Como Cliente:
1. ✅ Ver productos en la homepage
2. ✅ Buscar productos en `/productos`
3. ✅ Ver detalle de un producto
4. ✅ Agregar productos al carrito
5. ✅ Ver carrito en `/carrito`
6. ✅ Registrarse en `/registro`
7. ✅ Iniciar sesión en `/login`
8. ✅ Ver perfil en `/perfil`
9. ✅ Ver pedidos en `/pedidos`

### Como Admin:
1. ✅ Acceder al dashboard en `/admin`
2. ✅ Ver estadísticas
3. ✅ Crear producto en `/admin/productos/nuevo`
4. ✅ Editar productos
5. ✅ Ver pedidos en `/admin/pedidos`
6. ✅ Cambiar estado de pedidos

## 💳 Stripe (Opcional)

Para probar pagos completos:

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves de API del dashboard
3. Configúralas en `.env`
4. Para webhooks en desarrollo:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

**Nota:** Puedes probar la aplicación sin Stripe, pero el checkout necesitará las claves.

## 🐛 Problemas Comunes

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté corriendo
- Revisa la URL en `DATABASE_URL`
- Asegúrate de que la base de datos exista

### Error de NextAuth
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de que `NEXTAUTH_URL` sea correcto

### Error al instalar dependencias
- Usa Node.js 18 o superior
- Limpia caché: `npm cache clean --force`
- Elimina `node_modules` y `package-lock.json`, luego `npm install`

## 📚 Más Información

Consulta el `README.md` para más detalles sobre el proyecto.
