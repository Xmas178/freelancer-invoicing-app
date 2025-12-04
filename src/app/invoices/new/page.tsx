'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Type definitions
type Customer = {
    id: string
    name: string
    businessId?: string
}



export default function NewInvoicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])

    const [formData, setFormData] = useState({
        companyId: '',
        customerId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        subtotal: '0',
        vatAmount: '0',
        total: '0',
        status: 'draft',
        notes: '',
    })

    // LineItems state - array of invoice line items
    const [lineItems, setLineItems] = useState([
        {
            description: '',
            quantity: 1,
            unitPrice: 0,
            vatRate: 25.5
        }
    ])

    // Add a new empty line item
    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { description: '', quantity: 1, unitPrice: 0, vatRate: 25.5 }
        ])
    }

    // Remove a line item by index (keep at least one)
    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index))
        }
    }

    // Update a specific field in a line item
    const updateLineItem = (index: number, field: string, value: string | number) => {
        const updated = [...lineItems]
        updated[index] = { ...updated[index], [field]: value }
        setLineItems(updated)
    }

    // Fetch companies and customers on mount
    useEffect(() => {
        fetchCustomers()

        // Set due date to 30 days from now
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)
        setFormData(prev => ({
            ...prev,
            dueDate: dueDate.toISOString().split('T')[0]
        }))
    }, [])

    // Calculate totals automatically when line items change
    useEffect(() => {
        // Calculate subtotal from all line items
        const subtotal = lineItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice)
        }, 0)

        // Calculate VAT amount (25.5%)
        const vatAmount = subtotal * 0.255

        // Calculate total (subtotal + VAT)
        const total = subtotal + vatAmount

        // Update form data with calculated values
        setFormData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            vatAmount: vatAmount.toFixed(2),
            total: total.toFixed(2)
        }))
    }, [lineItems])



    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers')
            const data = await res.json()

            // Check if response is an error
            if (data.error) {
                console.error('Customer fetch error:', data.error)
                // If no company setup, redirect to setup
                if (data.error.includes('company setup')) {
                    window.location.href = '/setup'
                    return
                }
                setCustomers([]) // Set empty array on error
                return
            }

            // Set customers if data is valid array
            if (Array.isArray(data)) {
                setCustomers(data)
            } else {
                setCustomers([])
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error)
            setCustomers([])
        }
    }

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerId) {
            alert('Valitse asiakas')
            return
        }

        setLoading(true)

        try {
            // Convert string amounts to numbers for API
            const payload = {
                ...formData,
                subtotal: parseFloat(formData.subtotal),
                vatAmount: parseFloat(formData.vatAmount),
                total: parseFloat(formData.total),
                lineItems: lineItems,
            }

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                router.push('/invoices')
            } else {
                const errorData = await res.json()
                alert(`Virhe tallennuksessa: ${errorData.error || 'Tuntematon virhe'}`)
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Virhe tallennuksessa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Luo uusi lasku</h1>
                        <p className="text-gray-600 text-lg">Täytä laskun tiedot</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Asiakas *
                            </label>
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Valitse asiakas</option>
                                {Array.isArray(customers) && customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} {customer.businessId ? `(${customer.businessId})` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        Ei asiakkaita - luo asiakas ensin
                                    </option>
                                )}
                            </select>
                            <a href="/customers/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                                + Lisää uusi asiakas
                            </a>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Laskun päivämäärä *
                                </label>
                                <input
                                    type="date"
                                    name="invoiceDate"
                                    value={formData.invoiceDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Eräpäivä *
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Line Items Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">Laskurivit</h3>
                                <button
                                    type="button"
                                    onClick={addLineItem}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    + Lisää rivi
                                </button>
                            </div>

                            {/* Line Items Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                Kuvaus
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                                                Määrä
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                                                À-hinta (€)
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                                                Yhteensä (€)
                                            </th>
                                            <th className="px-4 py-3 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {lineItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                        placeholder="Tuote/palvelu"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.quantity === 0 ? '' : item.quantity}
                                                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                        min="0"
                                                        step="1"
                                                        placeholder="1"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                                                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {(item.quantity * item.unitPrice).toFixed(2)} €
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                        disabled={lineItems.length === 1}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">Veroton summa:</span>
                                <span className="font-semibold">{parseFloat(formData.subtotal || '0').toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">ALV (25,5%):</span>
                                <span className="font-semibold">{parseFloat(formData.vatAmount || '0').toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-xl border-t pt-2">
                                <span className="font-bold">Yhteensä:</span>
                                <span className="font-bold text-blue-600">{parseFloat(formData.total || '0').toFixed(2)} €</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Tila
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="draft">Luonnos</option>
                                <option value="sent">Lähetetty</option>
                                <option value="paid">Maksettu</option>
                                <option value="overdue">Myöhässä</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Muistiinpanot
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Lisätiedot tai muistiinpanot..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Tallennetaan...' : 'Luo lasku'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/invoices')}
                                className="px-8 py-4 text-xl border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Peruuta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}