import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BillInsight AI',
  description: 'Modern Energy Prediction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}