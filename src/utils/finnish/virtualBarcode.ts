// Finnish virtual barcode generator (Virtuaaliviivakoodi)
// Generates 54-digit numeric string for Finnish online banking
// Format: Version 4 with RF reference (structured reference)
// Customer can copy-paste this into their online bank to auto-fill payment details

/**
 * Generate Finnish virtual barcode (Version 4 - RF reference)
 *
 * Structure (54 digits total):
 * - Version: 4 (1 digit)
 * - IBAN: 16 digits (without FI prefix, padded with zeros)
 * - Amount: 8 digits (euros + cents, e.g., 00001505 = 15.05€)
 * - Reserved: 3 zeros
 * - RF Reference: 2-23 digits (without RF prefix)
 * - Due date: 6 digits (DDMMYY format)
 *
 * Reference: Finnish Federation of Financial Services
 * https://www.finanssiala.fi/maksujenvalitys/dokumentit/virtuaaliviivakoodi_opas.pdf
 */
export function generateVirtualBarcode(
    iban: string,           // Finnish IBAN (e.g., "FI1234567890123456")
    amount: number,         // Payment amount in euros (e.g., 150.50)
    rfReference: string,    // RF reference (e.g., "RF123456789")
    dueDate: Date          // Payment due date
): string {
    // Version 4 = RF reference format
    const version = '4'

    // Extract IBAN account number (remove "FI" prefix, keep only digits)
    // Pad with leading zeros to exactly 16 digits
    const ibanDigits = iban.replace(/[^0-9]/g, '')
    const paddedIban = ibanDigits.padStart(16, '0').slice(0, 16)

    // Convert amount to cents and format as 8 digits
    // Example: 150.50€ → 00015050
    const amountInCents = Math.round(amount * 100)
    const paddedAmount = amountInCents.toString().padStart(8, '0')

    // Reserved field (always 3 zeros)
    const reserved = '000'

    // Extract RF reference number (remove "RF" prefix, keep only digits)
    // Finnish virtual barcode standard requires 20 digits for RF reference
    // Pad with zeros on the LEFT if reference is shorter than 20 digits
    const rfDigits = rfReference.replace(/[^0-9]/g, '')

    // Pad to exactly 20 digits (standard length for virtual barcode)
    // Example: "74001" → "00000000000000074001"
    const paddedReference = rfDigits.padStart(20, '0').slice(0, 23)

    // Format due date as DDMMYY (Finnish banking standard)
    // Example: 2024-12-15 → 151224
    // NOTE: This is DDMMYY, not YYMMDD!
    const year = dueDate.getFullYear().toString().slice(2) // Last 2 digits
    const month = (dueDate.getMonth() + 1).toString().padStart(2, '0')
    const day = dueDate.getDate().toString().padStart(2, '0')
    const formattedDate = day + month + year  // DDMMYY format!

    // Combine all parts into 54-digit barcode
    const barcode = version + paddedIban + paddedAmount + reserved + paddedReference + formattedDate

    // DEBUG: Print all parts to see what went wrong
    console.log('Virtual Barcode Debug:')
    console.log('Version:', version, 'Length:', version.length)
    console.log('IBAN:', paddedIban, 'Length:', paddedIban.length)
    console.log('Amount:', paddedAmount, 'Length:', paddedAmount.length)
    console.log('Reserved:', reserved, 'Length:', reserved.length)
    console.log('Reference:', paddedReference, 'Length:', paddedReference.length)
    console.log('Date:', formattedDate, 'Length:', formattedDate.length)
    console.log('Total barcode:', barcode)
    console.log('Total length:', barcode.length)
    console.log('Expected: 54 digits')

    // Validate final length (must be exactly 54 digits)
    if (barcode.length !== 54) {
        console.error('Virtual barcode generation error:', {
            version,
            paddedIban,
            paddedAmount,
            reserved,
            paddedReference,
            formattedDate,
            totalLength: barcode.length
        })
        throw new Error(`Virtual barcode must be 54 digits, got ${barcode.length}`)
    }

    return barcode
}

/**
 * Format virtual barcode with spaces for better readability
 * Splits 54 digits into groups of 5 digits
 * Example: 412345678901234567890000123456789012345151224
 * Becomes: 4 12345 67890 12345 67890 00001 23456 78901 23451 51224
 */
export function formatVirtualBarcode(barcode: string): string {
    // First digit alone (version), then groups of 5
    const parts = [barcode[0]]

    for (let i = 1; i < barcode.length; i += 5) {
        parts.push(barcode.slice(i, i + 5))
    }

    return parts.join(' ')
}
