import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DeepCodeX',
  description: 'AI-powered code generation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 