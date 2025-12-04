import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'

export default async function InvoicesPage() {
    // Get session
    const session = await auth()

    if (!session?.user?.id) {
        return <div>Unauthorized</div>
    }

    // Fetch invoices directly from database (Server Component)
    const invoices = await prisma.invoice.findMany({
        where: {
            company: {
                userId: session.user.id
            }
        },
        include: {
            customer: true
        },
        orderBy: {
            invoiceDate: 'desc'
        }
    })

    // Translate status to Finnish
    const getStatusText = (status: string) => {
        const statuses: { [key: string]: string } = {
            'draft': 'Luonnos',
            'sent': 'Lähetetty',
            'paid': 'Maksettu',
            'overdue': 'Myöhässä',
        }
        return statuses[status] || status
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Back to home button */}
                <div className="mb-4">
                    <a href="/" className="text-blue-600 hover:text-blue-800 text-lg flex items-center gap-2">
                        ← Etusivu
                    </a>
                </div>

                {/* Header with title and create button */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Laskut</h1>
                    <a href="/invoices/new" className="bg-green-500 text-white px-6 py-3 text-xl rounded-lg hover:bg-green-600">
                        + Uusi lasku
                    </a>
                </div>

                {invoices.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        Ei laskuja. Luo ensimmäinen lasku!
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Laskun numero
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Asiakas
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Päivämäärä
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Eräpäivä
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Summa
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Tila
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-lg">
                                            <a href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                                                {invoice.invoiceNumber}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {invoice.customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {new Date(invoice.invoiceDate).toLocaleDateString('fi-FI')}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {new Date(invoice.dueDate).toLocaleDateString('fi-FI')}
                                        </td>
                                        <td className="px-6 py-4 text-lg font-semibold">
                                            {invoice.total.toFixed(2)} €
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                                                {getStatusText(invoice.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}