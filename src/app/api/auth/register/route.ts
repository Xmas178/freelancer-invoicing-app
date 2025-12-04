// User registration API endpoint
// Creates new user account with hashed password
// Validates email uniqueness and password strength
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
    // Rate limiting: 5 registration attempts per 15 minutes per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`register:${ip}`, {
        interval: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5
    })

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many registration attempts. Please try again later.',
                resetTime: rateLimitResult.resetTime
            },
            { status: 429 }
        )
    }

    try {
        // Parse request body
        const body = await request.json()
        const { name, email, password } = body

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate email format (basic check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })

        return NextResponse.json(
            {
                message: 'User created successfully',
                user
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}