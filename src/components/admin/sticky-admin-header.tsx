"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function StickyAdminHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function updateScrolled() {
      setScrolled(window.scrollY > 2)
    }

    updateScrolled()
    window.addEventListener("scroll", updateScrolled, { passive: true })
    return () => window.removeEventListener("scroll", updateScrolled)
  }, [])

  return (
    <div
      className={cn(
        "sticky top-0 z-30 px-4 py-3 transition-all duration-300 ease-out sm:px-6 lg:px-12 xl:px-16",
        scrolled && "bg-white shadow-[0_10px_24px_-22px_rgba(28,27,26,0.5)]"
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  )
}
