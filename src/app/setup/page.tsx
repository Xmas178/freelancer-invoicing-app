// Company setup page (onboarding)
// User must complete this before creating invoices
// Links Company to authenticated User

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function SetupPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        businessId: '', // Can be empty for private persons
        address: '',
        postalCode: '',
        city: '',
        country: 'Finland',
        email: '',
        phone: '',
        bankAccount: '',
        bic: '',
    })

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Ladataan...</p>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        router.push('/login')
        return null
    }

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
            // Create company via API (userId added automatically on backend)
            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                // Redirect to invoices page after successful setup
                router.push('/invoices')
            } else {
                const error = await res.json()
                alert(error.error || 'Virhe tallennuksessa')
            }
        } catch {
            alert('Virhe tallennuksessa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-3xl w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-blue-600 mb-4">
                        Tervetuloa{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
                    </h1>
                    <p className="text-2xl text-gray-600">
                        Aloitetaan luomalla laskuttajan tiedot
                    </p>
                    <p className="text-lg text-gray-500 mt-2">
                        Voit olla yrittäjä, yksityishenkilö tai järjestö
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Nimi / Yrityksen nimi *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="esim. CodeNob Oy tai Matti Meikäläinen"
                        />
                    </div>

                    {/* Business ID (optional) */}
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
                            placeholder="esim. 1234567-8 (jätä tyhjäksi jos yksityishenkilö)"
                        />
                    </div>

                    {/* Address */}
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
                            placeholder="esim. Esimerkkikatu 1"
                        />
                    </div>

                    {/* Postal Code & City */}
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

                    {/* Email & Phone */}
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
                                placeholder="info@example.com"
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

                    {/* Bank Account & BIC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Tilinumero (IBAN) *
                            </label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={formData.bankAccount}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="FI21 1234 5600 0007 85"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                BIC *
                            </label>
                            <input
                                type="text"
                                name="bic"
                                value={formData.bic}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="NDEAFIHH"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Tallennetaan...' : 'Aloita laskutus →'}
                    </button>
                </form>
            </div>
        </div>
    )
}