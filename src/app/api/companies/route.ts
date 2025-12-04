// Companies API endpoint
// Handles creating and fetching companies for authenticated users
// Each company belongs to a specific user (multi-tenant ready)
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// GET - Fetch all companies for current user
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

        // Fetch companies belonging to current user only
        const companies = await prisma.company.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(companies)
    } catch (error) {
        console.error('Error fetching companies:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create new company
export async function POST(request: Request) {
    // Rate limiting: 10 company creations per hour per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`companies:${ip}`, {
        interval: 60 * 60 * 1000, // 1 hour
        maxRequests: 10
    })

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests. Please try again later.',
                resetTime: rateLimitResult.resetTime
            },
            { status: 429 }
        )
    }

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

        // Parse request body
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.address || !body.postalCode || !body.city || !body.email || !body.phone || !body.bankAccount || !body.bic) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if user already has a company (optional - remove if user can have multiple)
        const existingCompany = await prisma.company.findFirst({
            where: {
                userId: session.user.id
            }
        })

        if (existingCompany) {
            return NextResponse.json(
                { error: 'You already have a company. Edit existing company instead.' },
                { status: 409 }
            )
        }

        // Create company linked to current user
        const company = await prisma.company.create({
            data: {
                userId: session.user.id, // Link to authenticated user
                name: body.name,
                businessId: body.businessId || '', // Optional field
                address: body.address,
                postalCode: body.postalCode,
                city: body.city,
                country: body.country || 'Finland',
                email: body.email,
                phone: body.phone,
                iban: body.bankAccount,
                bic: body.bic,
            }
        })

        return NextResponse.json(company, { status: 201 })
    } catch (error) {
        console.error('Error creating company:', error)
        return NextResponse.json(
            { error: 'Failed to create company' },
            { status: 500 }
        )
    }
}