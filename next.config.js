/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 'domains' es la forma antigua, pero la dejamos por compatibilidad
    domains: ['localhost', 'via.placeholder.com, res.cloudinary.com'], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // 👇 AGREGADO: El dominio específico que te dio error
      {
        protocol: 'https',
        hostname: 'p1-ofp.static.pub',
      },
      // 👇 OPCIONAL (Recomendado para desarrollo): 
      // Permite cualquier imagen HTTPS para que no te vuelva a pasar esto mientras pruebas.
      // Cuando pases a producción, puedes quitar este bloque si quieres más seguridad.
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig