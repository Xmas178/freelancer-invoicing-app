// Rate limiting utility for API routes
// Prevents brute force attacks and API abuse
// Uses in-memory storage (consider Redis for production)

interface RateLimitStore {
    [key: string]: {
        count: number
        resetTime: number
    }
}

const rateLimitStore: RateLimitStore = {}

interface RateLimitConfig {
    interval: number // Time window in milliseconds
    maxRequests: number // Maximum requests per interval
}

/**
 * Rate limiter function
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig = { interval: 60000, maxRequests: 10 }
): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier

    // Clean up expired entries every 100 requests
    if (Math.random() < 0.01) {
        Object.keys(rateLimitStore).forEach((k) => {
            if (rateLimitStore[k].resetTime < now) {
                delete rateLimitStore[k]
            }
        })
    }

    // Initialize or get existing rate limit data
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
        rateLimitStore[key] = {
            count: 1,
            resetTime: now + config.interval
        }
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime: rateLimitStore[key].resetTime
        }
    }

    // Increment request count
    rateLimitStore[key].count++

    // Check if limit exceeded
    if (rateLimitStore[key].count > config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetTime: rateLimitStore[key].resetTime
        }
    }

    return {
        success: true,
        remaining: config.maxRequests - rateLimitStore[key].count,
        resetTime: rateLimitStore[key].resetTime
    }
}

/**
 * Get client IP from request headers
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
    // Try multiple headers for IP (considering proxies)
    const headers = new Headers(request.headers)
    return (
        headers.get('x-forwarded-for')?.split(',')[0] ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    )
}