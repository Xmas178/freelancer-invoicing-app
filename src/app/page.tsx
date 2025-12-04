// Home page - Landing page after login
// Displays user info and navigation to main features

import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
    // Get current session (server component)
    const session = await auth()

    // If not logged in, redirect to login page
    // (middleware should catch this, but double check)
    if (!session) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with user info and logout */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Laskutusohjelma
                        </h1>
                        <p className="text-sm text-gray-600">
                            Tervetuloa, {session.user?.name || session.user?.email}!
                        </p>
                    </div>

                    {/* Logout button */}
                    <form
                        action={async () => {
                            'use server'
                            await signOut({ redirectTo: '/login' })
                        }}
                    >
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 py-4">
                        <Link
                            href="/invoices"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                        >
                            Laskut
                        </Link>
                        <Link
                            href="/customers"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                        >
                            Asiakkaat
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Aloitus </h2>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Olet nyt kirjautunut sisään! Tämä on laskutuksen hallintapaneeli.

                        </p>

                        {/* Quick actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <Link
                                href="/invoices/new"
                                className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                            >
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Luo lasku
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Luo uusi lasku asiakkaallesi
                                </p>
                            </Link>

                            <Link
                                href="/customers/new"
                                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                            >
                                <h3 className="text-lg font-semibold text-green-900 mb-2">
                                    Lisää asiakas
                                </h3>
                                <p className="text-sm text-green-700">
                                    Lisää uusi asiakas tietokantaasi
                                </p>
                            </Link>
                        </div>

                        {/* Setup reminder if no company */}
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                <strong>Seuraava vaihe: Luo yritysprofiilisi</strong>
                                <br />
                                Ennen laskujen luomista, sinun täytyy asettaa yrityksesi tiedot.
                            </p>
                            <Link
                                href="/setup"
                                className="mt-3 inline-block px-4 py-2 text-sm font-medium text-yellow-900 bg-yellow-200 rounded-md hover:bg-yellow-300"
                            >
                                Perusta yritys
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}