import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
    title: 'Freelancer Invoicing App',
    description: 'Finnish invoice generator for freelancers',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    )
}