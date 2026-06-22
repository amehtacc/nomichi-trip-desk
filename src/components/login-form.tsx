"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function friendlyLoginMessage(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "The email or password does not look right. Please check both and try again."
  }

  if (normalized.includes("email not confirmed")) {
    return "This account still needs email confirmation before it can sign in."
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "There have been too many attempts. Please wait a minute, then try again."
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "The login service is not available right now. Please try again in a moment."
  }

  return "We could not sign you in. Please check your details and try again."
}

function validateEmail(email: string) {
  const trimmedEmail = email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!trimmedEmail) {
    return "Please enter your email address."
  }

  if (!emailPattern.test(trimmedEmail)) {
    return "Please enter a valid email address, like name@example.com."
  }

  return ""
}

function validateLogin(email: string, password: string) {
  const emailMessage = validateEmail(email)
  if (emailMessage) return emailMessage

  if (!password) {
    return "Please enter your password."
  }

  return ""
}

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    const validationMessage = validateLogin(email, password)
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          setMessage(friendlyLoginMessage(error.message))
          return
        }

        router.push("/admin/dashboard")
        router.refresh()
      } catch (error) {
        setMessage(
          error instanceof Error
            ? friendlyLoginMessage(error.message)
            : "We could not sign you in. Please try again."
        )
      }
    })
  }

  return (
    <form onSubmit={submit} className="relative grid gap-6" noValidate>
      <label className="grid gap-2">
        <span className="text-sm font-medium">Email</span>
        <Input
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (message) setMessage("")
          }}
          onBlur={() => {
            const validationMessage = validateEmail(email)
            if (validationMessage) setMessage(validationMessage)
          }}
          type="text"
          inputMode="email"
          placeholder="associate@thenomichi.com"
          disabled={!configured || isPending}
          autoComplete="email"
          aria-invalid={Boolean(message && validateEmail(email))}
          className="h-12 rounded-md border-sand/60 bg-card px-4 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium">Password</span>
        <Input
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (message) setMessage("")
          }}
          type="password"
          placeholder="Password"
          disabled={!configured || isPending}
          autoComplete="current-password"
          required
          className="h-12 rounded-md border-sand/60 bg-card px-4 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </label>

      <Button
        type="submit"
        className="mt-1 h-12 w-full bg-ink text-cream hover:bg-primary"
        disabled={!configured || isPending}
      >
        {isPending ? "Signing in" : "Sign in"}
      </Button>

      {message ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-0 right-0 top-[calc(100%+1rem)] z-20 rounded-md border border-destructive/20 bg-cream/95 px-3 py-2 text-sm leading-5 text-destructive shadow-lg"
        >
          {message}
        </div>
      ) : null}
    </form>
  )
}
