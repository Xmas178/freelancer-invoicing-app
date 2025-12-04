'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCustomerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        businessId: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'Finland',
        email: '',
        phone: '',
    })

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push('/customers')
            } else {
                alert('Virhe tallennuksessa')
            }
        } catch {
            alert('Virhe tallennuksessa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Lisää uusi asiakas</h1>
                        <p className="text-gray-600 text-lg">Täytä asiakkaan tiedot</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Nimi *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Yritys Oy tai Matti Meikäläinen"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Y-tunnus (valinnainen)
                            </label>
                            <input
                                type="text"
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1234567-8"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Osoite *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Esimerkkikatu 1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Postinumero *
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="00100"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Kaupunki *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Helsinki"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Sähköposti *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="asiakas@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Puhelin *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+358 40 123 4567"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white py-4 text-xl font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Tallennetaan...' : 'Tallenna asiakas'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/customers')}
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