import { prisma } from '@/lib/db/client'
import { notFound } from 'next/navigation'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: {
            company: true,
            customer: true,
            lineItems: { orderBy: { order: 'asc' } }
        }
    })

    if (!invoice) notFound()

    const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fi-FI')
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('fi-FI')
    const statusMap: { [key: string]: string } = {
        draft: 'Luonnos', sent: 'Lähetetty', paid: 'Maksettu', overdue: 'Myöhässä'
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Lasku {invoice.invoiceNumber}</h1>
                        <p className="text-gray-600 text-lg">Tila: <span className="font-semibold">{statusMap[invoice.status]}</span></p>
                    </div>
                    <a href="/invoices" className="px-6 py-3 text-lg border rounded-lg hover:bg-gray-50">← Takaisin</a>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Laskuttaja</h3>
                            <p className="font-bold text-lg">{invoice.company.name}</p>
                            <p className="text-gray-600">Y-tunnus: {invoice.company.businessId}</p>
                            <p className="text-gray-600">{invoice.company.address}</p>
                            <p className="text-gray-600">{invoice.company.postalCode} {invoice.company.city}</p>
                            <p className="text-gray-600 mt-2">{invoice.company.email}</p>
                            <p className="text-gray-600">{invoice.company.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Asiakas</h3>
                            <p className="font-bold text-lg">{invoice.customer.name}</p>
                            {invoice.customer.businessId && <p className="text-gray-600">Y-tunnus: {invoice.customer.businessId}</p>}
                            <p className="text-gray-600">{invoice.customer.address}</p>
                            <p className="text-gray-600">{invoice.customer.postalCode} {invoice.customer.city}</p>
                            <p className="text-gray-600 mt-2">{invoice.customer.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                        <div><p className="text-sm text-gray-600 mb-1">Laskun päivämäärä</p><p className="text-lg font-semibold">{invoiceDate}</p></div>
                        <div><p className="text-sm text-gray-600 mb-1">Eräpäivä</p><p className="text-lg font-semibold">{dueDate}</p></div>
                        <div><p className="text-sm text-gray-600 mb-1">Viitenumero</p><p className="text-lg font-semibold">{invoice.rfReference}</p></div>
                    </div>

                    <div className="mb-8">
                        <div className="bg-yellow-200 border-4 border-yellow-600 p-6 mb-4 rounded-lg">
                            <p className="text-2xl font-bold">🔍 DEBUG: LineItems = {invoice.lineItems?.length || 0}</p>
                            <pre className="text-sm mt-2 bg-white p-2 rounded">{JSON.stringify(invoice.lineItems, null, 2)}</pre>
                        </div>

                        <h3 className="text-xl font-semibold mb-4">Laskurivit</h3>
                        {invoice.lineItems && invoice.lineItems.length > 0 ? (
                            <table className="min-w-full border rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold">Kuvaus</th>
                                        <th className="px-6 py-3 text-right font-semibold">Määrä</th>
                                        <th className="px-6 py-3 text-right font-semibold">À-hinta</th>
                                        <th className="px-6 py-3 text-right font-semibold">Yhteensä</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invoice.lineItems.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">{item.description}</td>
                                            <td className="px-6 py-4 text-right">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right">{item.unitPrice.toFixed(2)} €</td>
                                            <td className="px-6 py-4 text-right font-semibold">{item.total.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-500 italic">Ei laskurivejä</p>}
                    </div>

                    <div className="flex justify-end">
                        <div className="w-80 space-y-2 bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between text-lg">
                                <span>Veroton:</span><span className="font-semibold">{invoice.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span>ALV (25,5%):</span><span className="font-semibold">{invoice.vatAmount.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold border-t-2 pt-3">
                                <span>YHTEENSÄ:</span><span className="text-blue-600">{invoice.total.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="font-semibold mb-1">Lisätiedot:</p><p>{invoice.notes}</p>
                        </div>
                    )}

                    <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Maksutiedot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-sm text-gray-600">IBAN</p><p className="font-mono font-semibold">{invoice.company.iban}</p></div>
                            <div><p className="text-sm text-gray-600">BIC</p><p className="font-mono font-semibold">{invoice.company.bic}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}