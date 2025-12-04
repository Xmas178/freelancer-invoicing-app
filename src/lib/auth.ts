// Authentication configuration for NextAuth.js v5
// Uses Credentials provider (email/password) with bcrypt hashing
// Session strategy: JWT (no database sessions for better performance)

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/client"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // Use JWT sessions (stored in cookies, not database)
    // Faster than database sessions, suitable for most apps
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Security: Secure cookies and CSRF protection
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },

    // Authentication providers
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },

            // Authorization logic: verify email/password
            async authorize(credentials) {
                // Validate input exists
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                // User not found
                if (!user) {
                    return null
                }

                // Compare provided password with hashed password in database
                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                // Password doesn't match
                if (!passwordMatch) {
                    return null
                }

                // Success! Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            }
        })
    ],

    // Callback functions to customize behavior
    callbacks: {
        // Called whenever a JWT is created or updated
        async jwt({ token, user }) {
            // On first sign in, add user id to token
            if (user) {
                token.id = user.id
            }
            return token
        },

        // Called whenever session is checked (e.g. useSession, getServerSession)
        async session({ session, token }) {
            // Add user id from token to session object
            if (token && session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    },

    // Custom pages
    pages: {
        signIn: "/login", // Custom login page
    },
})