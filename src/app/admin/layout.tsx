import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNav } from "@/components/admin/admin-nav"
import { StickyAdminHeader } from "@/components/admin/sticky-admin-header"
import { requireUser } from "@/lib/data"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-cream paper-texture lg:flex">
      <AdminNav mobileHeader={<AdminHeader user={user} viewport="mobile" />} />
      <div className="min-w-0 flex-1 lg:pl-72">
        <div className="hidden lg:block">
          <StickyAdminHeader>
            <AdminHeader user={user} viewport="desktop" />
          </StickyAdminHeader>
        </div>
        <main className="px-4 py-6 sm:px-6 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-7xl space-y-6 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
