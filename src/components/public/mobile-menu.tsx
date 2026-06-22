"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const menuItems = [
  ["Trips", "#trips"],
  ["About Nomichi", "#enquiry"],
  ["How it works", "#how-it-works"],
  ["Travel with us", "#enquiry"],
  ["Contact", "#enquiry"],
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-12 cursor-pointer place-items-center rounded-md border border-primary/20 bg-cream/85 text-ink shadow-sm transition-colors duration-300 ease-out hover:bg-primary hover:text-cream lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div
        className={`fixed inset-0 z-[100] bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      >
        <aside
          className={`h-full w-[70vw] max-w-xs bg-cream p-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex leading-none" onClick={() => setOpen(false)}>
              <Image
                src="/images/nomichi-logo-rust.svg"
                alt="Nomichi"
                width={170}
                height={43}
                className="h-auto w-36"
              />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid size-10 cursor-pointer place-items-center rounded-md border border-sand/60 bg-card text-ink transition-colors duration-300 ease-out hover:bg-primary hover:text-cream"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="mt-10 grid gap-2">
            {menuItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-4 font-display text-2xl font-bold text-ink transition-colors duration-300 ease-out hover:bg-primary hover:text-cream"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </>
  )
}
