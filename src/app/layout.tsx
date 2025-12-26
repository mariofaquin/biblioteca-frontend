import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BiblioTech - Sistema de Biblioteca',
  description: 'Sistema completo de gestão de biblioteca v1.0.30',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}