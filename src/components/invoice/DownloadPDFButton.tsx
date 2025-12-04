'use client'

// Client component for downloading invoice as PDF
// Uses jsPDF to generate Finnish invoice format
import { generateInvoicePDF } from '@/utils/pdf/generateInvoicePDF'

interface DownloadPDFButtonProps {
    invoice: {
        invoiceNumber: string
        invoiceDate: Date
        dueDate: Date
        rfReference: string
        status: string
        subtotal: number
        vatAmount: number
        total: number
        notes?: string | null
        company: {
            name: string
            businessId: string
            address: string
            postalCode: string
            city: string
            email: string
            phone: string | null
            iban: string
            bic: string
        }
        customer: {
            name: string
            businessId?: string | null
            address: string
            postalCode: string
            city: string
            email: string
        }
        lineItems: Array<{
            description: string
            quantity: number
            unitPrice: number
            total: number
        }>
    }
}

export default function DownloadPDFButton({ invoice }: DownloadPDFButtonProps) {
    // Handle PDF download
    const handleDownload = () => {
        // Format dates to Finnish locale
        const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fi-FI')
        const dueDate = new Date(invoice.dueDate).toLocaleDateString('fi-FI')

        // Prepare data for PDF generation
        const pdfData = {
            ...invoice,
            invoiceDate,
            dueDate,
        }

        // Generate and download PDF
        generateInvoicePDF(pdfData)
    }

    return (
        <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
            📥 Lataa PDF
        </button>
    )
}