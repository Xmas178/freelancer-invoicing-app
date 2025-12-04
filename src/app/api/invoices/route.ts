// Invoices API endpoint
// Handles creating and fetching invoices for authenticated users
// Each invoice belongs to a company (multi-tenant architecture)

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'
import { calculateRFReference } from '@/utils/finnish/rf-reference'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// LineItem type for invoice creation
type LineItemInput = {
    description: string
    quantity: number
    unitPrice: number
    vatRate: number
}

// GET - Fetch all invoices for current user's company
// Returns list of invoices with company and customer details
export async function GET() {
    try {
        // Get current authenticated session
        const session = await auth()

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's company (required for multi-tenant filtering)
        const company = await prisma.company.findFirst({
            where: {
                userId: session.user.id
            }
        })

        // User hasn't completed company setup yet
        if (!company) {
            return NextResponse.json(
                { error: 'Please complete company setup first' },
                { status: 400 }
            )
        }

        // Fetch all invoices belonging to user's company
        // Includes related company and customer data for display
        const invoices = await prisma.invoice.findMany({
            where: {
                companyId: company.id
            },
            orderBy: {
                createdAt: 'desc'  // Newest first
            },
            include: {
                company: true,
                customer: true,
            }
        })

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Error fetching invoices:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create new invoice
// Generates invoice number, RF reference, and creates line items
// POST - Create new invoice
export async function POST(request: Request) {
    // Rate limiting: 30 invoice creations per hour per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`invoices:${ip}`, {
        interval: 60 * 60 * 1000, // 1 hour
        maxRequests: 30
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
        // Get current authenticated session
        const session = await auth()

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's company (required for invoice creation)
        const company = await prisma.company.findFirst({
            where: {
                userId: session.user.id
            }
        })

        // User hasn't completed company setup yet
        if (!company) {
            return NextResponse.json(
                { error: 'Please complete company setup first' },
                { status: 400 }
            )
        }

        // Parse request body (invoice data from frontend)
        const body = await request.json()

        // Security check: Validate companyId matches user's company
        if (body.companyId && body.companyId !== company.id) {
            return NextResponse.json(
                { error: 'Invalid company ID' },
                { status: 403 }
            )
        }

        // Security check: Validate customer belongs to user's company
        const customer = await prisma.customer.findUnique({
            where: { id: body.customerId }
        })

        if (!customer || customer.companyId !== company.id) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 403 }
            )
        }

        // Generate unique invoice number (auto-increment per company)
        // Get the highest invoice number for this company to avoid duplicates
        const lastInvoice = await prisma.invoice.findFirst({
            where: {
                companyId: company.id
            },
            orderBy: {
                invoiceNumber: 'desc'  // Order by invoice number string (INV-001, INV-002, etc.)
            }
        })

        // DEBUG: Log invoice number generation process
        console.log('=== INVOICE NUMBER GENERATION DEBUG ===')
        console.log('Company ID:', company.id)
        console.log('Last invoice found:', lastInvoice)

        // Parse last number and increment, or start from 001
        let nextNumber = 1
        if (lastInvoice) {
            console.log('Last invoice number:', lastInvoice.invoiceNumber)
            const lastNumberStr = lastInvoice.invoiceNumber.split('-')[1]
            console.log('Extracted number:', lastNumberStr)
            nextNumber = parseInt(lastNumberStr) + 1
            console.log('Next number will be:', nextNumber)
        } else {
            console.log('No previous invoices found, starting from 001')
        }

        const invoiceNumber = `INV-${String(nextNumber).padStart(3, '0')}`
        console.log('Generated invoice number:', invoiceNumber)
        console.log('=======================================')

        // Calculate RF reference (Finnish reference number standard)
        // Used for automatic payment matching in Finnish banks
        const rfReference = calculateRFReference(invoiceNumber)

        // Create invoice with line items in a single database transaction
        // This ensures data consistency (all or nothing)
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                companyId: company.id,  // Link to authenticated user's company
                customerId: body.customerId,
                invoiceDate: new Date(body.invoiceDate),
                dueDate: new Date(body.dueDate),
                rfReference,
                subtotal: body.subtotal,
                vatAmount: body.vatAmount,
                total: body.total,
                status: body.status || 'draft',
                notes: body.notes || null,
                // Create line items at the same time (nested create)
                lineItems: {
                    create: body.lineItems.map((item: LineItemInput, index: number) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        vatRate: item.vatRate,
                        total: item.quantity * item.unitPrice,
                        order: index + 1,  // Maintain line item order
                    })),
                },
            },
            // Include related data in response for immediate display
            include: {
                company: true,
                customer: true,
                lineItems: true,
            }
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error('Error creating invoice:', error)
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        )
    }
}