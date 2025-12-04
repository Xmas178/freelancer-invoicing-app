export default function Navigation() {
    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <a href="/" className="text-2xl font-bold hover:text-blue-200">
                        Laskutus
                    </a>

                    {/* Navigation Links */}
                    <div className="flex gap-6">
                        <a href="/invoices" className="text-xl hover:text-blue-200 transition">
                            Laskut
                        </a>
                        <a href="/customers" className="text-xl hover:text-blue-200 transition">
                            Asiakkaat
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    )
}