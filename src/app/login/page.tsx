// User login page
// Authenticates users with email and password using NextAuth.js
// Redirects to home page on successful login

'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check if user just registered (show success message)
    const registered = searchParams.get('registered')

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        try {
            // Attempt to sign in with NextAuth credentials provider
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false, // Don't redirect automatically, handle it manually
            })

            if (result?.error) {
                // Login failed
                setError('Virheellinen sähköposti tai salasana')
                setLoading(false)
                return
            }

            // Success! Redirect to home page
            router.push('/')
            router.refresh() // Refresh to update session state
        } catch {
            setError('Jokin meni pieleen')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Kirjaudu sisään
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        tai{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            luo uusi tili
                        </Link>
                    </p>
                </div>

                {/* Success message if just registered */}
                {registered && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                            Tili luotu onnistuneesti! Voit nyt kirjautua sisään.
                        </p>
                    </div>
                )}

                {/* Login form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Error message */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
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
                                placeholder="Sähköposti"
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
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Salasana"
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
                            {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}