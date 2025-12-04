// Customers API endpoint
// Handles creating and fetching customers for authenticated users
// Each customer belongs to a company (multi-tenant ready)

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// GET - Fetch all customers for current user's company
export async function GET() {
    try {
        // Get current session
        const session = await auth()

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's company
        const company = await prisma.company.findFirst({
            where: {
                userId: session.user.id
            }
        })

        // User doesn't have a company yet
        if (!company) {
            return NextResponse.json(
                { error: 'Please complete company setup first' },
                { status: 400 }
            )
        }

        // Fetch customers belonging to user's company
        const customers = await prisma.customer.findMany({
            where: {
                companyId: company.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(customers)
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create new customer
// POST - Create new customer
export async function POST(request: Request) {
    // Rate limiting: 20 customer creations per hour per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`customers:${ip}`, {
        interval: 60 * 60 * 1000, // 1 hour
        maxRequests: 20
    })

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests. Please try again later.',
                resetTime: rateLimitResult.resetTime
            },
            { status: 429 }
        )
    } try {
        // Get current session
        const session = await auth()

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's company
        const company = await prisma.company.findFirst({
            where: {
                userId: session.user.id
            }
        })

        // User doesn't have a company yet
        if (!company) {
            return NextResponse.json(
                { error: 'Please complete company setup first' },
                { status: 400 }
            )
        }

        // Parse request body
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.address || !body.postalCode || !body.city || !body.email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create customer linked to user's company
        const customer = await prisma.customer.create({
            data: {
                companyId: company.id, // Link to company
                name: body.name,
                businessId: body.businessId || null,
                address: body.address,
                postalCode: body.postalCode,
                city: body.city,
                country: body.country || 'Finland',
                email: body.email,
                phone: body.phone || null,
            }
        })

        return NextResponse.json(customer, { status: 201 })
    } catch (error) {
        console.error('Error creating customer:', error)
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        )
    }
}