// PDF generation utility for Finnish invoices
// Generates A4-sized PDF with company details, line items, SEPA QR code, and payment info
// Following Finnish invoice standards and SEPA payment QR code specification (EPC QR standard)

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { generateVirtualBarcode, formatVirtualBarcode } from '@/utils/finnish/virtualBarcode'

// Interface for invoice data structure
// Defines all required fields for generating a complete Finnish invoice PDF
interface InvoiceData {
    invoiceNumber: string
    invoiceDate: string          // Format: DD.MM.YYYY
    dueDate: string              // Format: DD.MM.YYYY
    rfReference: string          // Finnish RF reference number
    status: string               // draft | sent | paid | overdue
    subtotal: number             // Amount before VAT
    vatAmount: number            // VAT amount (25.5% in Finland)
    total: number                // Total amount including VAT
    notes?: string | null        // Optional additional notes
    company: {
        name: string
        businessId: string       // Y-tunnus (Finnish business ID)
        address: string
        postalCode: string
        city: string
        email: string
        phone: string | null     // Optional phone number
        iban: string             // International Bank Account Number
        bic: string              // Bank Identifier Code
    }
    customer: {
        name: string
        businessId?: string | null  // Optional Y-tunnus for business customers
        address: string
        postalCode: string
        city: string
        email: string
    }
    lineItems: Array<{
        description: string      // Product/service description
        quantity: number         // Amount of items
        unitPrice: number        // Price per unit
        total: number            // Line total (quantity * unitPrice)
    }>
}

// Generate SEPA payment QR code data string
// Format follows European Payments Council (EPC) QR code standard
// When scanned, this QR code auto-fills payment details in banking apps
// Reference: https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation
function generateSEPAString(
    iban: string,              // Beneficiary IBAN
    bic: string,               // Beneficiary BIC
    amount: number,            // Payment amount in EUR
    reference: string,         // Payment reference (RF reference)
    beneficiaryName: string    // Company name
): string {
    return [
        'BCD',                          // Service Tag (constant)
        '002',                          // Version (constant)
        '1',                            // Character set: 1 = UTF-8
        'SCT',                          // Identification: SCT = SEPA Credit Transfer
        bic,                            // BIC of beneficiary bank
        beneficiaryName,                // Name of the beneficiary (company)
        iban,                           // Beneficiary account (IBAN)
        `EUR${amount.toFixed(2)}`,      // Amount with currency code (e.g., EUR150.00)
        '',                             // Purpose code (optional, leave empty)
        reference,                      // Structured reference (RF reference number)
        '',                             // Unstructured remittance (leave empty when using structured ref)
        ''                              // Beneficiary to originator info (optional, leave empty)
    ].join('\n')
}

// Main PDF generation function
// Generates a complete Finnish invoice PDF with all required elements
// Returns a Promise because QR code generation is async
export async function generateInvoicePDF(invoice: InvoiceData) {
    // Create new PDF document with A4 portrait orientation
    // Unit: millimeters for precise positioning
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    // Set default font family
    doc.setFont('helvetica')

    // ============================================
    // HEADER SECTION
    // ============================================

    // Main title - top left
    doc.setFontSize(24)
    doc.text('LASKU', 20, 20)

    // Invoice metadata - top right
    doc.setFontSize(11)
    doc.text(`Laskun numero: ${invoice.invoiceNumber}`, 140, 20)
    doc.text(`Laskun päivämäärä: ${invoice.invoiceDate}`, 140, 27)
    doc.text(`Eräpäivä: ${invoice.dueDate}`, 140, 34)
    doc.text(`Viitenumero: ${invoice.rfReference}`, 140, 41)

    // ============================================
    // COMPANY (SENDER) INFORMATION - LEFT SIDE
    // ============================================

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Laskuttaja:', 20, 50)

    doc.setFont('helvetica', 'normal')
    doc.text(invoice.company.name, 20, 56)
    doc.text(`Y-tunnus: ${invoice.company.businessId}`, 20, 62)
    doc.text(invoice.company.address, 20, 68)
    doc.text(`${invoice.company.postalCode} ${invoice.company.city}`, 20, 74)
    doc.text(invoice.company.email, 20, 80)

    // Phone number is optional - only add if provided
    if (invoice.company.phone) {
        doc.text(invoice.company.phone, 20, 86)
    }

    // ============================================
    // CUSTOMER (RECIPIENT) INFORMATION - RIGHT SIDE
    // ============================================

    doc.setFont('helvetica', 'bold')
    doc.text('Asiakas:', 110, 50)

    doc.setFont('helvetica', 'normal')
    doc.text(invoice.customer.name, 110, 56)

    // Business customer has Y-tunnus, private customer doesn't
    if (invoice.customer.businessId) {
        doc.text(`Y-tunnus: ${invoice.customer.businessId}`, 110, 62)
        doc.text(invoice.customer.address, 110, 68)
        doc.text(`${invoice.customer.postalCode} ${invoice.customer.city}`, 110, 74)
        doc.text(invoice.customer.email, 110, 80)
    } else {
        // Private customer - no Y-tunnus line
        doc.text(invoice.customer.address, 110, 62)
        doc.text(`${invoice.customer.postalCode} ${invoice.customer.city}`, 110, 68)
        doc.text(invoice.customer.email, 110, 74)
    }

    // ============================================
    // LINE ITEMS TABLE
    // ============================================

    // Table starts lower if customer has businessId (more lines above)
    const tableStartY = invoice.customer.businessId ? 95 : 90

    // Use jspdf-autotable for professional table layout
    autoTable(doc, {
        startY: tableStartY,
        head: [['Kuvaus', 'Määrä', 'À-hinta (€)', 'Yhteensä (€)']],
        body: invoice.lineItems.map(item => [
            item.description,
            item.quantity.toString(),
            item.unitPrice.toFixed(2),
            item.total.toFixed(2)
        ]),
        theme: 'striped',                                           // Alternating row colors
        headStyles: {
            fillColor: [66, 139, 202],                             // Blue header background
            textColor: 255,                                         // White text
            fontStyle: 'bold'
        },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 80 },                                  // Description column - wide
            1: { cellWidth: 30, halign: 'right' },                 // Quantity - right aligned
            2: { cellWidth: 35, halign: 'right' },                 // Unit price - right aligned
            3: { cellWidth: 35, halign: 'right' }                  // Total - right aligned
        }
    })

    // Get Y position after table ends (for positioning next elements)
    const finalY = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    // ============================================
    // TOTALS SECTION - RIGHT ALIGNED
    // ============================================

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Subtotal (amount before VAT)
    doc.text('Veroton summa:', 140, finalY)
    doc.text(`${invoice.subtotal.toFixed(2)} €`, 185, finalY, { align: 'right' })

    // VAT amount (25.5% in Finland)
    doc.text('ALV (25,5%):', 140, finalY + 6)
    doc.text(`${invoice.vatAmount.toFixed(2)} €`, 185, finalY + 6, { align: 'right' })

    // Total amount (bold and larger)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('YHTEENSÄ:', 140, finalY + 14)
    doc.text(`${invoice.total.toFixed(2)} €`, 185, finalY + 14, { align: 'right' })

    // ============================================
    // SEPA QR CODE GENERATION
    // ============================================

    // Generate SEPA payment string according to EPC standard
    const sepaString = generateSEPAString(
        invoice.company.iban,
        invoice.company.bic,
        invoice.total,
        invoice.rfReference,
        invoice.company.name
    )

    // Convert SEPA string to QR code image (base64 data URL)
    // Customer can scan this with their banking app to auto-fill payment
    const qrCodeDataUrl = await QRCode.toDataURL(sepaString, {
        width: 200,                    // QR code size in pixels
        margin: 1,                     // Quiet zone around QR code
        color: {
            dark: '#000000',           // Black modules
            light: '#ffffff'           // White background
        }
    })

    // ============================================
    // VIRTUAL BARCODE GENERATION (Finnish banking)
    // ============================================

    // Parse due date from Finnish format (D.M.YYYY or DD.MM.YYYY) to Date object
    // Handle both single and double digit days/months (e.g., "1.1.2026" or "01.01.2026")
    const dateParts = invoice.dueDate.split('.')
    const day = parseInt(dateParts[0])
    const month = parseInt(dateParts[1])
    const yearStr = dateParts[2]
    const year = yearStr.length === 2 ? parseInt('20' + yearStr) : parseInt(yearStr)

    const dueDateObj = new Date(year, month - 1, day)

    // DEBUG: Verify date parsing
    console.log('Due date string:', invoice.dueDate)
    console.log('Parsed date object:', dueDateObj)
    console.log('Year:', year, 'Month:', month, 'Day:', day)

    // Generate 54-digit virtual barcode number
    const virtualBarcodeNumber = generateVirtualBarcode(
        invoice.company.iban,
        invoice.total,
        invoice.rfReference,
        dueDateObj
    )

    // Format barcode with spaces for readability (4 12345 67890...)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const barcodeForDisplay = formatVirtualBarcode(virtualBarcodeNumber)

    // Create canvas element for JsBarcode rendering
    // JsBarcode needs a canvas to draw the barcode image
    const canvas = document.createElement('canvas')

    // Generate Code128 barcode image
    // Code128 is the standard format for Finnish virtual barcodes
    JsBarcode(canvas, virtualBarcodeNumber, {
        format: 'CODE128',
        width: 2,              // Bar width
        height: 60,            // Bar height in pixels
        displayValue: false,   // Don't show number below bars (we'll add it manually)
        margin: 10
    })

    // Convert canvas to base64 data URL for PDF embedding
    const barcodeDataUrl = canvas.toDataURL('image/png')

    // ============================================
    // PAYMENT DETAILS SECTION (LEFT SIDE)
    // ============================================

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Maksutiedot:', 20, finalY + 25)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Tilinumero (IBAN): ${invoice.company.iban}`, 20, finalY + 32)
    doc.text(`BIC: ${invoice.company.bic}`, 20, finalY + 38)
    doc.text(`Viitenumero: ${invoice.rfReference}`, 20, finalY + 44)
    doc.text(`Eräpäivä: ${invoice.dueDate}`, 20, finalY + 50)

    // ============================================
    // QR CODE IMAGE (RIGHT SIDE OF PAYMENT DETAILS)
    // ============================================

    // Add QR code image to PDF
    // Position: right side, 50x50mm size
    doc.addImage(qrCodeDataUrl, 'PNG', 130, finalY + 20, 50, 50)

    // Add instruction text below QR code
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)  // Gray color
    doc.text('Skannaa maksaaksesi', 142, finalY + 73, { align: 'center' })
    doc.setTextColor(0, 0, 0)        // Reset to black

    /// ============================================
    // VIRTUAL BARCODE SECTION
    // ============================================

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Virtuaaliviivakoodi:', 20, finalY + 85)

    // Add barcode image
    doc.addImage(barcodeDataUrl, 'PNG', 20, finalY + 90, 170, 20)

    // Add barcode number below image (monospace font for easy copying)
    doc.setFont('courier', 'normal')
    doc.setFontSize(10)
    doc.text(virtualBarcodeNumber, 105, finalY + 115, { align: 'center' })  // No spaces!

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('Kopioi numero verkkopankkiisi', 105, finalY + 121, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    // ============================================
    // NOTES SECTION (IF PROVIDED) - Moved further down
    // ============================================

    if (invoice.notes) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('Lisätiedot:', 20, finalY + 130)

        doc.setFont('helvetica', 'normal')
        // Split long notes text to fit within margins
        const splitNotes = doc.splitTextToSize(invoice.notes, 170)
        doc.text(splitNotes, 20, finalY + 136)
    }
    // ============================================
    // FOOTER
    // ============================================

    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)  // Gray color
    doc.text('Maksuehdot: 14 päivää netto', 20, 280)
    doc.text(`Luotu: ${new Date().toLocaleDateString('fi-FI')}`, 150, 280)

    // ============================================
    // SAVE PDF TO USER'S DEVICE
    // ============================================

    // Triggers browser download with filename format: Lasku_INV-001.pdf
    doc.save(`Lasku_${invoice.invoiceNumber}.pdf`)
}