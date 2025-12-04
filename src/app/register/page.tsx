// User registration page
// Allows new users to create an account with email and password
// Password is hashed with bcrypt before storing in database

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    // UI state
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Salasanat eivät täsmää')
            setLoading(false)
            return
        }

        // Validate password length (basic validation)
        if (formData.password.length < 6) {
            setError('Salasanan on oltava vähintään 6 merkkiä pitkä')
            setLoading(false)
            return
        }

        try {
            // Call register API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                // Registration failed
                throw new Error(data.error || 'Registration failed')
            }

            // Success! Redirect to login page
            router.push('/login?registered=true')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Jokin meni pieleen')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Luo tili
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Onko sinulla jo tili?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Kirjaudu sisään
                        </Link>
                    </p>
                </div>

                {/* Registration form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Error message */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        {/* Name field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nimi
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nimi"
                            />
                        </div>

                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Sähköpostiosoite
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="sähköposti"
                            />
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Salasana
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Salasana (vähintään 6 merkkiä)"
                            />
                        </div>

                        {/* Confirm password field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Vahvista salasana
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Vahvista salasana"
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Luodaan tiliä...' : 'luo tili'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}