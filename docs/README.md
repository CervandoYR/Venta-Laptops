## Sistema SaaS para Academias Deportivas

Este monorepo contiene un backend en Node.js (Express), un frontend en React + Vite + Tailwind, y un esquema de base de datos PostgreSQL gestionado con Prisma, preparado para multi-tenant por academia.

### Estructura

- `client`: SPA React + Vite + Tailwind para landing pública y panel admin.
- `server`: API REST en Express (Node 20+ recomendado).
- `prisma`: `schema.prisma` y migraciones.
- `docs`: documentación.

### Requisitos

- Node.js 20+
- PostgreSQL 14+ (local o en contenedor)
- pnpm / npm / yarn (recomendado pnpm)

### Configuración base de datos

1. Crea una base de datos PostgreSQL.
2. Configura `DATABASE_URL` en `server/.env` (ejemplo):

   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/academies"
   ```

3. Ejecuta las migraciones desde la raíz del proyecto:

   ```bash
   cd prisma
   npx prisma migrate dev
   npx prisma generate
   ```

### Seeds iniciales

- Crea un archivo `prisma/seed.ts` donde se genere al menos:
  - Una `Academy` de ejemplo.
  - Un usuario `SUPER_ADMIN` y un `ADMIN`.
  - Algunos bloques de landing (`LandingBlock`) de ejemplo.

Puedes ejecutar el seed con:

```bash
cd prisma
npx ts-node seed.ts
```

### Backend (server)

1. Crea un archivo `server/.env`:

   ```env
   PORT=4000
   DATABASE_URL="postgresql://user:pass@localhost:5432/academies"
   CLIENT_ORIGIN=http://localhost:5173
   JWT_SECRET=super-secret
   JWT_REFRESH_SECRET=super-refresh
   ```

2. Instala dependencias en `server` (ejemplo con pnpm):

   ```bash
   cd server
   pnpm init -y
   pnpm add express cors helmet cookie-parser express-rate-limit dotenv
   pnpm add @prisma/client
   pnpm add -D typescript ts-node-dev @types/node @types/express @types/cookie-parser @types/cors
   ```

3. Añade scripts en `server/package.json`:

   ```json
   {
     "scripts": {
       "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
       "build": "tsc -p .",
       "start": "node dist/index.js"
     }
   }
   ```

4. Inicia el backend:

   ```bash
   cd server
   pnpm dev
   ```

### Frontend (client)

1. Dentro de `client`, inicializa Vite React + TS y Tailwind (si no lo está ya):

   ```bash
   cd client
   pnpm create vite@latest . -- --template react-ts
   pnpm add react-router-dom
   pnpm add -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. Configura Tailwind para usar `src/styles.css` y habilitar dark mode.

3. Lanza el frontend:

   ```bash
   cd client
   pnpm dev
   ```

### Multi-tenant

- El modelo `Academy` es la raíz de tenant.
- Todas las tablas de dominio tienen `academyId`.
- El middleware `tenantResolver` resuelve la academia desde el subdominio o la cabecera `x-academy-slug`.

### Deploy en AWS (resumen)

1. **Base de datos**: crear instancia RDS PostgreSQL, restringir accesos por security groups.
2. **Backend**:
   - EC2 con Node 20+.
   - Desplegar código `server` con Docker o PM2.
   - Nginx como reverse proxy (TLS con Let’s Encrypt).
3. **Frontend**:
   - `pnpm build` en `client`.
   - Servir estáticos con Nginx o subir a S3 + CloudFront.
4. **Assets (imágenes)**:
   - Bucket S3 privado con políticas para acceso desde backend.
   - Guardar URLs en `LandingMedia` y otros modelos.

Este README es un punto de partida; puedes ampliarlo con comandos concretos y ejemplos de docker-compose, scripts de seeds y pipelines CI/CD.

