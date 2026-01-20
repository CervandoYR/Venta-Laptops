import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servitek.com' },
    update: {},
    create: {
      email: 'admin@servitek.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Crear usuario de prueba
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'cliente@servitek.com' },
    update: {},
    create: {
      email: 'cliente@servitek.com',
      name: 'Cliente Demo',
      password: userPassword,
      role: 'USER',
    },
  })

  // Crear productos (laptops)
  const laptops = [
    {
      name: 'MacBook Pro 16" M3 Pro',
      slug: 'macbook-pro-16-m3-pro',
      description: 'Potente laptop profesional con chip M3 Pro, ideal para desarrollo y diseño. 16GB RAM, 512GB SSD, pantalla Retina de 16 pulgadas.',
      price: 2499.99,
      image: 'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=MacBook+Pro+16',
      images: ['https://via.placeholder.com/800x600/0ea5e9/ffffff?text=MacBook+Pro+16'],
      brand: 'Apple',
      model: 'MacBook Pro 16"',
      cpu: 'Apple M3 Pro (12-core)',
      ram: '16GB',
      storage: '512GB SSD',
      display: '16.2" Retina (3456 x 2234)',
      gpu: 'M3 Pro GPU (18-core)',
      stock: 10,
      featured: true,
    },
    {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Ultrabook premium con pantalla 4K OLED, procesador Intel i7 de 13va generación, 32GB RAM y GPU RTX 4060.',
      price: 1999.99,
      image: 'https://via.placeholder.com/800x600/0070ba/ffffff?text=Dell+XPS+15',
      images: ['https://via.placeholder.com/800x600/0070ba/ffffff?text=Dell+XPS+15'],
      brand: 'Dell',
      model: 'XPS 15',
      cpu: 'Intel Core i7-13700H (14-core)',
      ram: '32GB',
      storage: '1TB SSD',
      display: '15.6" 4K OLED Touch',
      gpu: 'NVIDIA RTX 4060 8GB',
      stock: 8,
      featured: true,
    },
    {
      name: 'HP Spectre x360 14',
      slug: 'hp-spectre-x360-14',
      description: 'Laptop convertible 2-en-1 con pantalla táctil, procesador Intel i7, 16GB RAM, diseño elegante en color azul noche.',
      price: 1499.99,
      image: 'https://via.placeholder.com/800x600/0096d6/ffffff?text=HP+Spectre+x360',
      images: ['https://via.placeholder.com/800x600/0096d6/ffffff?text=HP+Spectre+x360'],
      brand: 'HP',
      model: 'Spectre x360 14',
      cpu: 'Intel Core i7-1355U (10-core)',
      ram: '16GB',
      storage: '512GB SSD',
      display: '14" 2.8K OLED Touch (2880 x 1800)',
      gpu: 'Intel Iris Xe',
      stock: 12,
      featured: false,
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      slug: 'lenovo-thinkpad-x1-carbon',
      description: 'Laptop empresarial ultraportátil, procesador Intel i7, 16GB RAM, teclado ThinkPad legendario, construcción de fibra de carbono.',
      price: 1799.99,
      image: 'https://via.placeholder.com/800x600/e2231a/ffffff?text=ThinkPad+X1',
      images: ['https://via.placeholder.com/800x600/e2231a/ffffff?text=ThinkPad+X1'],
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon',
      cpu: 'Intel Core i7-1365U (10-core)',
      ram: '16GB',
      storage: '512GB SSD',
      display: '14" WQXGA (2880 x 1800)',
      stock: 15,
      featured: false,
    },
    {
      name: 'ASUS ROG Zephyrus G14',
      slug: 'asus-rog-zephyrus-g14',
      description: 'Laptop gaming compacta y potente, AMD Ryzen 9, 32GB RAM, RTX 4070, pantalla 14" 144Hz, diseño gaming premium.',
      price: 2199.99,
      image: 'https://via.placeholder.com/800x600/000000/ffffff?text=ASUS+ROG+G14',
      images: ['https://via.placeholder.com/800x600/000000/ffffff?text=ASUS+ROG+G14'],
      brand: 'ASUS',
      model: 'ROG Zephyrus G14',
      cpu: 'AMD Ryzen 9 7940HS (8-core)',
      ram: '32GB',
      storage: '1TB SSD',
      display: '14" QHD 144Hz (2560 x 1600)',
      gpu: 'NVIDIA RTX 4070 8GB',
      stock: 6,
      featured: true,
    },
    {
      name: 'Microsoft Surface Laptop 5',
      slug: 'microsoft-surface-laptop-5',
      description: 'Laptop elegante y minimalista, procesador Intel i7, 16GB RAM, pantalla PixelSense táctil, construcción premium en aluminio.',
      price: 1599.99,
      image: 'https://via.placeholder.com/800x600/0078d4/ffffff?text=Surface+Laptop+5',
      images: ['https://via.placeholder.com/800x600/0078d4/ffffff?text=Surface+Laptop+5'],
      brand: 'Microsoft',
      model: 'Surface Laptop 5',
      cpu: 'Intel Core i7-1255U (10-core)',
      ram: '16GB',
      storage: '512GB SSD',
      display: '13.5" PixelSense Touch (2256 x 1504)',
      gpu: 'Intel Iris Xe',
      stock: 10,
      featured: false,
    },
  ]

  for (const laptop of laptops) {
    await prisma.product.upsert({
      where: { slug: laptop.slug },
      update: {},
      create: laptop,
    })
  }

  console.log('✅ Seed completado:')
  console.log(`   - Admin: admin@servitek.com / admin123`)
  console.log(`   - Cliente: cliente@servitek.com / user123`)
  console.log(`   - ${laptops.length} productos creados`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
