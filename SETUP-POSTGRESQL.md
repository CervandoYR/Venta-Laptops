# 🗄️ Configuración de PostgreSQL - Guía Paso a Paso

## Paso 1: Crear el archivo .env

### Opción A: Usando PowerShell (Recomendado)

1. Abre PowerShell en la carpeta del proyecto:
   ```powershell
   cd C:\Users\Cerva\Desktop\Venta-Laptops
   ```

2. Crea el archivo `.env`:
   ```powershell
   New-Item -Path .env -ItemType File
   ```

3. Abre el archivo `.env` en un editor (Notepad, VS Code, etc.) y pega esto:
   ```env
   # Base de Datos PostgreSQL
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/servitek_db?schema=public"
   
   # NextAuth - Secret aleatorio
   NEXTAUTH_SECRET="cambia-este-secret-por-uno-aleatorio"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Stripe (opcional por ahora)
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

4. **Genera un NEXTAUTH_SECRET seguro** ejecutando en PowerShell:
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```
   Copia el resultado y reemplaza `"cambia-este-secret-por-uno-aleatorio"` en el `.env`

### Opción B: Crear manualmente

1. Abre un editor de texto (Notepad, VS Code, etc.)
2. Guarda un archivo nuevo llamado `.env` en la raíz del proyecto
3. Pega el contenido de arriba

---

## Paso 2: Configurar PostgreSQL

### Si ya tienes PostgreSQL instalado:

1. **Inicia PostgreSQL** (si no está corriendo):
   - Busca "Services" en Windows
   - Busca "postgresql" y asegúrate de que esté "Running"

2. **Abre pgAdmin o psql** para crear la base de datos:

   **Usando pgAdmin (Interfaz Gráfica):**
   - Abre pgAdmin 4
   - Conéctate al servidor PostgreSQL
   - Click derecho en "Databases" → "Create" → "Database"
   - Nombre: `servitek_db`
   - Click "Save"

   **Usando psql (Línea de comandos):**
   ```bash
   # Abre una terminal y ejecuta:
   psql -U postgres
   
   # Si te pide contraseña, ingrésala
   # Luego ejecuta:
   CREATE DATABASE servitek_db;
   
   # Verifica que se creó:
   \l
   
   # Sal de psql:
   \q
   ```

3. **Verifica tu configuración en el archivo `.env`:**
   
   Ajusta el `DATABASE_URL` según tu configuración:
   ```env
   DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/servitek_db?schema=public"
   ```
   
   Ejemplos comunes:
   - Usuario `postgres` con contraseña `postgres`: 
     ```env
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/servitek_db?schema=public"
     ```
   - Usuario `postgres` sin contraseña (no recomendado):
     ```env
     DATABASE_URL="postgresql://postgres@localhost:5432/servitek_db?schema=public"
     ```

### Si NO tienes PostgreSQL instalado:

1. **Descarga PostgreSQL:**
   - Ve a: https://www.postgresql.org/download/windows/
   - Descarga el instalador
   - O usa: https://www.postgresql.org/download/windows/enterprisedb/

2. **Instala PostgreSQL:**
   - Ejecuta el instalador
   - Durante la instalación:
     - **Anota la contraseña** que configures para el usuario `postgres`
     - **Asegúrate de recordar el puerto** (por defecto es 5432)
     - Deja marcadas las opciones por defecto

3. **Después de instalar**, crea la base de datos como se explica arriba.

---

## Paso 3: Configurar Prisma con la Base de Datos

Una vez que tengas PostgreSQL corriendo y la base de datos creada:

1. **Verifica que tu `.env` tenga la URL correcta** de la base de datos

2. **Sincroniza el esquema** (esto creará las tablas automáticamente):
   ```bash
   npx prisma db push
   ```

3. **Pobla la base de datos con datos de ejemplo:**
   ```bash
   npm run db:seed
   ```

4. **Verifica que todo funcionó:**
   ```bash
   npx prisma studio
   ```
   Esto abrirá una interfaz visual para ver los datos en tu navegador.

---

## 🧪 Verificar que todo funciona

Ejecuta estos comandos en orden:

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Verificar conexión a la base de datos
npx prisma db push

# 3. Poblar con datos de ejemplo
npm run db:seed

# 4. Iniciar el servidor
npm run dev
```

Si todo está bien, deberías ver:
- ✅ Conexión exitosa a la base de datos
- ✅ Tablas creadas
- ✅ Usuarios y productos creados
- ✅ Servidor corriendo en http://localhost:3000

---

## 🐛 Solución de Problemas

### Error: "Connection refused" o "no se puede conectar"
- Verifica que PostgreSQL esté corriendo (Services → postgresql)
- Verifica el puerto (por defecto es 5432)
- Verifica usuario y contraseña en `.env`

### Error: "database does not exist"
- Crea la base de datos manualmente como se explicó arriba
- O usa: `createdb servitek_db` si tienes las herramientas de PostgreSQL en tu PATH

### Error: "password authentication failed"
- Verifica que la contraseña en `.env` sea correcta
- Si olvidaste la contraseña, puedes cambiarla desde pgAdmin

### Error: "schema "public" does not exist"
- Esto es normal, Prisma lo creará automáticamente
- Solo ejecuta `npx prisma db push` y se solucionará

---

## 📝 Resumen de tu configuración

Una vez configurado, tu `.env` debería verse así:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/servitek_db?schema=public"
NEXTAUTH_SECRET="TU_SECRET_GENERADO_AQUI"
NEXTAUTH_URL="http://localhost:3000"
```

¡Y listo! Ya deberías poder ejecutar `npm run dev` sin problemas.
