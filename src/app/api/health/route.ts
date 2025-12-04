// Health check endpoint for Docker and monitoring
// Returns OK status if application is running
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'freelancer-invoicing-app'
    })
}