import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import * as bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Credenciales inválidas')
        }

        // ---------------------------------------------------------
        // 🪄 MAGIA: VINCULAR PEDIDOS DE INVITADO AL LOGUEARSE
        // ---------------------------------------------------------
        try {
          // Buscamos pedidos que coincidan con ESTE correo pero que no tengan dueño (userId: null)
          await prisma.order.updateMany({
            where: {
              shippingEmail: user.email, // El correo del usuario que acaba de entrar
              userId: null               // Solo pedidos que eran de "invitado"
            },
            data: {
              userId: user.id            // ¡Ahora le pertenecen a este usuario!
            }
          })
        } catch (error) {
          // Si esto falla, no detenemos el login, solo lo registramos (es un proceso secundario)
          console.error("Error vinculando pedidos antiguos:", error)
        }
        // ---------------------------------------------------------

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}