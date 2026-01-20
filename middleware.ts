import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/registro')

        // Permitir acceso a rutas públicas
        if (!isAdminRoute && !isAuthRoute) {
          return true
        }

        // Admin routes requieren autenticación
        if (isAdminRoute) {
          return !!token && token.role === 'ADMIN'
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/pedidos/:path*', '/perfil/:path*'],
}
