/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output standalone for Docker deployment
    output: 'standalone',
    // Strict mode helps find bugs during development
    reactStrictMode: true,
    // Disable x-powered-by header for security
    poweredByHeader: false,
    // Optimize images
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // Content Security Polcode /home/crake178/projects/freelancer-invoicing-app/next.config.jsicy - prevents XSS attacks
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
                    },
                    // Prevent clickjacking attacks
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    // Prevent MIME type sniffing
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    // Enable XSS protection in older browsers
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    // Referrer policy - control information sent in Referer header
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    // Permissions policy - control browser features
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    // HSTS - force HTTPS (only in production with HTTPS)
                    // Uncomment when deploying with HTTPS:
                    // {
                    //     key: 'Strict-Transport-Security',
                    //     value: 'max-age=31536000; includeSubDomains'
                    // }
                ],
            },
        ]
    },
}
module.exports = nextConfig