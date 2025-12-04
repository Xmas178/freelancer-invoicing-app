// Middleware for protecting routes with authentication
// Checks if user is authenticated before allowing access to protected pages
// Redirects to login page if not authenticated

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(pathname)

    // API routes that don't require authentication
    // IMPORTANT: All /api/auth/* routes must be public for NextAuth to work!
    const publicApiRoutes = ['/api/auth']
    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

    // If trying to access protected route without being logged in
    if (!isLoggedIn && !isPublicRoute && !isPublicApiRoute) {
        // Redirect to login page
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // If logged in and trying to access login/register page
    if (isLoggedIn && isPublicRoute) {
        // Redirect to home page
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Allow request to proceed
    return NextResponse.next()
})

// Configure which routes this middleware runs on
export const config = {
    // Run middleware on all routes except static files and images
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}