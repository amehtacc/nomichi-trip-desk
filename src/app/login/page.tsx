import Image from "next/image"
import { redirect } from "next/navigation"
import { AutoDismissMessage } from "@/components/auto-dismiss-message"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/data"
import { hasSupabaseConfig } from "@/lib/supabase/config"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const configured = hasSupabaseConfig()
  const user = configured ? await getCurrentUser() : null

  if (user) {
    redirect("/admin/dashboard")
  }

  const reason = (await searchParams).reason

  return (
    <main className="paper-texture grid min-h-screen place-items-center bg-ink px-4 py-10 text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(213,93,39,0.28),transparent_25rem),radial-gradient(circle_at_88%_78%,rgba(209,183,136,0.16),transparent_22rem)]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-xl border border-cream/12 bg-cream text-ink shadow-2xl lg:grid-cols-[1fr_440px]">
        <section className="relative hidden min-h-[620px] overflow-hidden bg-ink p-10 text-cream lg:block">
          <Image
            src="/images/hero-girl.png"
            alt="Traveller looking over mountain ridges"
            fill
            sizes="50vw"
            className="object-cover opacity-42"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,27,26,0.96),rgba(28,27,26,0.72),rgba(28,27,26,0.35))]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Image
              src="/images/nomichi-logo-rust.svg"
              alt="Nomichi"
              width={176}
              height={44}
              className="h-auto w-40"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Team desk
              </p>
              <h1 className="mt-4 max-w-xl font-display text-5xl font-extrabold leading-tight">
                Keep every traveller conversation in one place.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-cream/72">
                Leads, trips, notes, ownership, and first messages for the
                team&apos;s Monday morning.
              </p>
            </div>
          </div>
        </section>

        <Card className="relative gap-0 overflow-hidden rounded-none border-0 bg-cream py-0 text-ink shadow-none">
          <Image
            src="/images/hills-sun-birds.png"
            alt=""
            width={550}
            height={250}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 z-0 w-full max-w-none select-none opacity-80"
          />
          <CardHeader className="relative z-10 px-6 pb-4 pt-8 sm:px-8">
            <Image
              src="/images/nomichi-logo-rust.svg"
              alt="Nomichi"
              width={150}
              height={38}
              className="mb-8 h-auto w-36 lg:hidden"
            />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Nomichi Trip Desk
            </p>
            <CardTitle className="font-display text-4xl font-bold">
              Associate login
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in to manage enquiries from first contact to confirmed seat.
            </p>
          </CardHeader>
          <CardContent className="relative z-10 grid gap-5 px-6 pb-36 sm:px-8">
            {!configured ? (
              <AutoDismissMessage className="rounded-md border border-primary/30 bg-cream/95 px-3 py-2 text-sm leading-5 text-primary shadow-lg">
                The team login is not connected yet. Add the local connection
                details before using the admin workspace.
              </AutoDismissMessage>
            ) : null}
            {reason === "setup" ? (
              <AutoDismissMessage className="rounded-md border border-olive/20 bg-cream/95 px-3 py-2 text-sm leading-5 text-olive shadow-lg">
                The team workspace needs login access before it can open.
              </AutoDismissMessage>
            ) : null}
            <LoginForm configured={configured} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
