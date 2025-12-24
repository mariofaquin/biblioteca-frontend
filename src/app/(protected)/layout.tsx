import { CompanyGuard } from '@/components/auth/company-guard'
import { Navbar } from '@/components/layout/navbar'
import { HorizontalMenu } from '@/components/layout/horizontal-menu'
import { SimpleHorizontalMenu } from '@/components/layout/simple-horizontal-menu'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <HorizontalMenu />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </CompanyGuard>
  )
}