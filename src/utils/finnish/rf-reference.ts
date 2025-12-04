/**
 * Calculate Finnish RF reference number
 * Based on ISO 11649 standard (Creditor Reference)
 * RF reference is used in Finnish banking for automatic payment matching
 *
 * Format: RF + 2 check digits + reference number
 * Example: RF74001 (RF + 74 + 001)
 *
 * This implementation avoids BigInt for better compatibility
 */

/**
 * Modulo 97 calculation for large numbers (as strings)
 * Used for ISO 11649 check digit calculation
 * Processes the number in chunks to avoid BigInt
 */
function mod97(numStr: string): number {
    let remainder = 0

    // Process string in chunks to avoid overflow
    for (let i = 0; i < numStr.length; i++) {
        remainder = (remainder * 10 + parseInt(numStr[i])) % 97
    }

    return remainder
}

/**
 * Generate RF reference number from invoice number
 *
 * @param invoiceNumber - Invoice number (e.g., "INV-001")
 * @returns RF reference (e.g., "RF74001")
 */
export function calculateRFReference(invoiceNumber: string): string {
    // Extract only numeric characters from invoice number
    // Example: "INV-001" → "001"
    const numericPart = invoiceNumber.replace(/\D/g, '')

    // If no numbers found, use timestamp as fallback
    // This ensures we always have a valid reference
    const baseNumber = numericPart || Date.now().toString().slice(-8)

    // ISO 11649 check digit calculation:
    // 1. Append "RF00" converted to numbers: RF = 2715, 00 = 00
    // 2. Calculate mod 97
    // 3. Check digits = 98 - remainder
    const temp = baseNumber + '271500' // RF=2715, 00=placeholder
    const remainder = mod97(temp)
    const checkDigits = (98 - remainder).toString().padStart(2, '0')

    // Return complete RF reference
    // Format: RF + check digits + base number
    return `RF${checkDigits}${baseNumber}`
}

/**
 * Validate RF reference number
 * Checks if the check digits are correct
 *
 * @param rfReference - RF reference to validate (e.g., "RF74001")
 * @returns true if valid, false otherwise
 */
export function validateRFReference(rfReference: string): boolean {
    // Remove spaces and convert to uppercase
    const cleaned = rfReference.replace(/\s/g, '').toUpperCase()

    // Check format: RF + 2 digits + at least 1 digit
    if (!/^RF\d{3,}$/.test(cleaned)) {
        return false
    }

    // Extract parts
    const checkDigits = cleaned.substring(2, 4)
    const baseNumber = cleaned.substring(4)

    // Recalculate check digits
    const temp = baseNumber + '271500'
    const remainder = mod97(temp)
    const calculatedCheckDigits = (98 - remainder).toString().padStart(2, '0')

    // Compare
    return checkDigits === calculatedCheckDigits
}