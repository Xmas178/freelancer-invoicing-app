import { prisma } from '@/lib/db/client'
import DownloadPDFButton from '@/components/invoice/DownloadPDFButton'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function InvoiceDetailPage({ params }: PageProps) {
    // Await params for Next.js 15 compatibility
    const { id } = await params

    // Fetch invoice with all relations
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            company: true,
            customer: true,
            lineItems: {
                orderBy: { order: 'asc' }
            }
        }
    })

    // If invoice not found, show 404
    if (!invoice) {
        notFound()
    }

    // Format dates
    const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fi-FI')
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('fi-FI')

    // Status translation
    const statusMap: { [key: string]: string } = {
        draft: 'Luonnos',
        sent: 'Lähetetty',
        paid: 'Maksettu',
        overdue: 'Myöhässä'
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Lasku {invoice.invoiceNumber}</h1>
                        <p className="text-gray-600 text-lg">
                            Tila: <span className="font-semibold">{statusMap[invoice.status]}</span>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <DownloadPDFButton invoice={invoice} />

                        <a href="/invoices"
                            className="px-6 py-3 text-lg border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            ← Takaisin
                        </a>
                    </div>
                </div>

                {/* Invoice Details Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* From (Company) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Laskuttaja</h3>
                            <p className="font-bold text-lg">{invoice.company.name}</p>
                            <p className="text-gray-600">Y-tunnus: {invoice.company.businessId}</p>
                            <p className="text-gray-600">{invoice.company.address}</p>
                            <p className="text-gray-600">{invoice.company.postalCode} {invoice.company.city}</p>
                            <p className="text-gray-600 mt-2">{invoice.company.email}</p>
                            <p className="text-gray-600">{invoice.company.phone}</p>
                        </div>

                        {/* To (Customer) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Asiakas</h3>
                            <p className="font-bold text-lg">{invoice.customer.name}</p>
                            {invoice.customer.businessId && (
                                <p className="text-gray-600">Y-tunnus: {invoice.customer.businessId}</p>
                            )}
                            <p className="text-gray-600">{invoice.customer.address}</p>
                            <p className="text-gray-600">{invoice.customer.postalCode} {invoice.customer.city}</p>
                            <p className="text-gray-600 mt-2">{invoice.customer.email}</p>
                        </div>
                    </div>

                    {/* Invoice Info */}
                    <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Laskun päivämäärä</p>
                            <p className="text-lg font-semibold">{invoiceDate}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Eräpäivä</p>
                            <p className="text-lg font-semibold">{dueDate}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Viitenumero</p>
                            <p className="text-lg font-semibold">{invoice.rfReference}</p>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Laskurivit</h3>
                        {invoice.lineItems && invoice.lineItems.length > 0 ? (
                            <table className="min-w-full border rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                            Kuvaus
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                            Määrä
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                            À-hinta
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                            Yhteensä
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoice.lineItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 text-gray-900">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {item.unitPrice.toFixed(2)} €
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                {item.total.toFixed(2)} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 italic">Ei laskurivejä</p>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-80 space-y-2 bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">Veroton summa:</span>
                                <span className="font-semibold">{invoice.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">ALV (25,5%):</span>
                                <span className="font-semibold">{invoice.vatAmount.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold border-t-2 pt-3">
                                <span>YHTEENSÄ:</span>
                                <span className="text-blue-600">{invoice.total.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Lisätiedot:</p>
                            <p className="text-gray-600">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Bank Details */}
                    <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Maksutiedot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Tilinumero (IBAN)</p>
                                <p className="font-mono font-semibold">{invoice.company.iban}</p>                            </div>
                            <div>
                                <p className="text-sm text-gray-600">BIC</p>
                                <p className="font-mono font-semibold">{invoice.company.bic}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}