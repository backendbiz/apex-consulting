import type { Metadata } from 'next'
import { Montserrat, Open_Sans } from 'next/font/google'
import '../(frontend)/styles.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Secure Checkout | DZTech',
  description: 'Complete your purchase securely.',
}

export default function CheckoutAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="antialiased font-sans bg-gray-50">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
