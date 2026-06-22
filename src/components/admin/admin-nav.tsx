"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, SlidersHorizontal, Users } from "lucide-react"

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home, match: true },
  { href: "/admin/leads", label: "Leads", icon: SlidersHorizontal, match: true },
  { href: "/admin/trips", label: "Trips", icon: Users, match: true },
]

export function AdminNav({ mobileHeader }: { mobileHeader?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <aside className="contents text-ink lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-72 lg:border-r lg:bg-[#fbf5e9]">
      <div className="contents lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-sand/50 px-4 py-4 sm:px-6 lg:block lg:border-b-0 lg:px-8 lg:pb-9 lg:pt-9">
          <Link href="/admin/dashboard" className="inline-flex">
            <Image
              src="/images/nomichi-logo-rust.svg"
              alt="Nomichi"
              width={182}
              height={46}
              className="h-auto w-36 sm:w-40"
            />
          </Link>
          {mobileHeader ? (
            <div className="lg:hidden">{mobileHeader}</div>
          ) : null}
        </div>

        <nav className="sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-sand/50 bg-[#fbf5e9] px-4 py-2 shadow-[0_10px_24px_-24px_rgba(28,27,26,0.55)] lg:static lg:z-auto lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:border-b-0 lg:py-1 lg:shadow-none">
          {items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                Boolean(item.match) &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`))
              }
            />
          ))}
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="mx-6 mb-6 overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-sand/40">
            <div className="relative h-56 overflow-hidden bg-sand/20 p-6">
              <p className="relative z-10 font-display text-xl font-bold leading-6 text-ink">
                Travel that
                <br />
                finds you.
              </p>
              <p className="relative z-10 mt-4 max-w-36 text-xs leading-5 text-ink/70">
                We build journeys that create stories for life.
              </p>
              <Image
                src="/images/hills-sun-birds.png"
                alt=""
                width={420}
                height={190}
                className="absolute bottom-0 left-0 w-full opacity-95"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex h-12 shrink-0 items-center gap-3 rounded-lg bg-[#f4eadb] px-5 text-sm font-semibold text-primary transition-colors duration-300 ease-out"
          : "flex h-12 shrink-0 items-center gap-3 rounded-lg px-5 text-sm font-medium text-ink transition-colors duration-300 ease-out hover:bg-[#f4eadb] hover:text-primary"
      }
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
    </Link>
  )
}
