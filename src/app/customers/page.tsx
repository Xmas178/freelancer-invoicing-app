// Customers page - displays all customers for current user's company
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'

export default async function CustomersPage() {
    // Get session
    const session = await auth()

    if (!session?.user?.id) {
        return <div>Unauthorized</div>
    }

    // Fetch customers directly from database (Server Component)
    const customers = await prisma.customer.findMany({
        where: {
            company: {
                userId: session.user.id
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header with title and create button */}
                {/* Back to home button */}
                <div className="mb-4">
                    <a href="/" className="text-blue-600 hover:text-blue-800 text-lg flex items-center gap-2">
                        ← Etusivu
                    </a>
                </div>

                {/* Header with title and create button */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Asiakkaat</h1>
                    <a href="/customers/new" className="bg-green-500 text-white px-6 py-3 text-xl rounded-lg hover:bg-green-600">
                        + Uusi asiakas
                    </a>
                </div>

                {/* Empty state or customers table */}
                {customers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        Ei asiakkaita. Lisää ensimmäinen asiakas!
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Customers table */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Nimi
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Y-tunnus
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Kaupunki
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Sähköposti
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Puhelin
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Map through customers and render rows */}
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-lg font-semibold">
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {/* Show businessId or "Yksityishenkilö" if null */}
                                            {customer.businessId || <span className="text-gray-400 italic">Yksityishenkilö</span>}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {customer.city}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            {customer.phone}
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