"use client"

import { useEffect, useState } from "react"

export function AutoDismissMessage({
  children,
  className,
  duration = 5000,
}: {
  children: React.ReactNode
  className: string
  duration?: number
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), duration)

    return () => window.clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  return (
    <div role="status" aria-live="polite" className={className}>
      {children}
    </div>
  )
}
