import type { ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Heart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { AutoDismissMessage } from "@/components/auto-dismiss-message"
import { EnquiryForm } from "@/components/public/enquiry-form"
import { MobileMenu } from "@/components/public/mobile-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOpenTrips } from "@/lib/data"
import { formatDate, formatMoney } from "@/lib/format"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import type { Trip } from "@/lib/types"

type IconComponent = ComponentType<{ className?: string }>

const tripImages: Record<string, string> = {
  Kashmir: "/images/trips/kashmir.png",
  Goa: "/images/trips/goa.png",
  "Arunachal Pradesh": "/images/trips/tawang.png",
  Rajasthan: "/images/trips/rajasthan.png",
}

export default async function Home() {
  const trips = await getOpenTrips()
  const isConfigured = hasSupabaseConfig()

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink paper-texture">
      <Hero />
      <HeroContent trips={trips} isConfigured={isConfigured} />

      <HowItWorks />

      <section
        id="trips"
        className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-14 xl:px-10"
      >
       

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured Trips
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink/70">
              Handpicked journeys to offbeat places. Real experiences. Small
              groups. Big memories.
            </p>
          </div>
          <a
            href="#enquiry"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 ease-out hover:text-ink"
          >
            View all trips
            <ArrowRight className="size-4" />
          </a>
        </div>

        {trips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-sand bg-card p-10 text-center">
            <h3 className="font-display text-2xl font-bold">No open trips yet.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              New journeys will appear here as soon as the Nomichi team opens
              the next small-group departure.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {trips.slice(0, 4).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-4 rounded-2xl bg-card/80 p-4 soft-paper-shadow sm:grid-cols-2 xl:grid-cols-4">
          {([
            [Sparkles, "Curated with care", "Trips designed and run by our own team."],
            [HeartHandshake, "Offbeat and conscious", "We travel slow and leave places better."],
            [ShieldCheck, "Safe and supportive", "Your comfort and safety come first."],
            [Users, "Real connections", "Travel with people you will truly connect with."],
          ] as Array<[IconComponent, string, string]>).map(([Icon, title, body]) => (
            <div key={String(title)} className="flex gap-4 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sand/35 text-olive">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{String(title)}</h3>
                <p className="mt-1 text-sm leading-6 text-ink/70">
                  {String(body)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FinalCta />

      <Footer />
    </main>
  )
}

function Hero() {
  return (
    <section className="paper-noise relative min-h-[760px] overflow-hidden bg-cream">
      <Image
        src="/images/hero-travel-final.png"
        alt="A traveller looking over mountain ridges"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,#fffaf1_0%,rgba(255,250,241,0.98)_24%,rgba(255,250,241,0.72)_47%,rgba(255,250,241,0.08)_78%)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_45%_28%,rgba(255,251,245,0.5),transparent_20rem)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-36 bg-[linear-gradient(180deg,transparent_0%,rgba(255,251,245,0.5)_44%,#fffbf5_100%)]" />
      <TornHeroSeparator />

      <header className="relative z-[70] mx-auto flex max-w-[1440px] items-center justify-between px-4 py-7 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="inline-flex leading-none">
          <Image
            src="/images/nomichi-logo-rust.svg"
            alt="Nomichi"
            width={170}
            height={43}
            priority
            className="h-auto w-36 sm:w-40"
          />
        </Link>
        <nav className="hidden items-center gap-9 text-sm font-medium lg:flex">
          {["Trips", "About Nomichi", "How it works", "Travel with us", "Contact"].map(
            (item) => (
              <a
                key={item}
                href={
                  item === "Trips"
                    ? "#trips"
                    : item === "How it works"
                      ? "#how-it-works"
                      : "#enquiry"
                }
                className="group relative flex h-8 items-center pb-1 transition-colors duration-300 ease-out hover:text-primary"
              >
                {item}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-[width] duration-300 ease-out group-hover:w-full" />
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
        <Button asChild className="h-12 rounded-md bg-primary px-5 text-cream shadow-sm hover:bg-ink sm:px-7">
            <a href="#enquiry">Send Enquiry</a>
        </Button>
        <MobileMenu />
        </div>
      </header>

    </section>
  )
}

function HeroContent({
  trips,
  isConfigured,
}: {
  trips: Trip[]
  isConfigured: boolean
}) {
  return (
    <section className="relative z-20 -mt-[610px] mx-auto grid max-w-[1440px] gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,440px)] lg:px-8 xl:grid-cols-[1fr_500px] xl:px-10 2xl:grid-cols-[1fr_520px]">
      <div className="pt-8 lg:pt-20">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">
          Slow travel. Real connections.
        </p>
        <h1 className="mt-5 max-w-2xl font-display text-6xl font-extrabold leading-[0.95] sm:text-7xl xl:text-8xl">
          Travel that
          <br />
          finds you<span className="text-primary">.</span>
        </h1>
        <p className="mt-7 max-w-md text-lg leading-8 text-ink/82">
          Small-group journeys designed for people who want travel to feel
          personal.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-md border-primary/40 bg-cream/70 px-7 text-ink shadow-sm hover:border-primary hover:bg-primary hover:text-cream"
          >
            <a href="#trips">
              Browse Trips
              <ArrowRight className="size-4 text-primary" />
            </a>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex -space-x-3">
            {["A", "N", "K"].map((initial) => (
              <span
                key={initial}
                className="grid size-10 place-items-center rounded-full border-2 border-cream bg-sand font-display font-bold text-ink"
              >
                {initial}
              </span>
            ))}
          </div>
          <p className="max-w-xs leading-6">
            Join <span className="font-bold text-primary">1,000+</span>{" "}
            like-minded travellers on meaningful journeys.
          </p>
        </div>
      </div>

      <div>
        {!isConfigured ? (
          <AutoDismissMessage className="mb-4 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-primary">
            Demo trips are visible locally. Connect the project database to
            save real enquiries.
          </AutoDismissMessage>
        ) : null}
        <EnquiryForm trips={trips} disabled={trips.length === 0} />
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1440px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-7">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink/70">
          A simple path from first enquiry to a confirmed seat with the
          Nomichi team.
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-sand/45 bg-card/80 p-4 soft-paper-shadow sm:grid-cols-2 xl:grid-cols-4">
        {([
          ["Choose a trip", "Browse open journeys and pick what feels right."],
          ["Tell us your vibe", "Share who you are travelling with and what you want this to feel like."],
          ["We call you", "The Nomichi team reaches out with details and fit."],
          ["Confirm your seat", "If it feels right, we help you lock the seat."],
        ] as Array<[string, string]>).map(([title, body], index) => (
          <div key={title} className="flex gap-4 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-olive text-sm font-bold text-yellow">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/70">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TornHeroSeparator() {
  return (
    <svg
      className="absolute inset-x-0 bottom-[-1px] z-10 h-28 w-full text-cream"
      viewBox="0 0 1440 132"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 86L45 91C90 96 180 97 270 94C360 91 450 80 540 82C630 84 720 101 810 100C900 99 990 78 1080 67C1170 56 1260 55 1350 65L1440 75V132H0V86Z"
      />
      <path
        fill="currentColor"
        opacity="0.96"
        d="M0 95L32 96C64 97 128 99 192 97C256 95 320 89 384 87C448 85 512 87 576 85C640 83 704 76 768 84C832 92 896 115 960 118C1024 121 1088 104 1152 91C1216 78 1280 69 1344 70C1408 71 1432 77 1440 79V132H0V95Z"
      />
    </svg>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  const image =
    trip.image_url ?? tripImages[trip.destination] ?? "/images/trips/kashmir.png"

  return (
    <Card className="group gap-0 overflow-hidden rounded-lg border-sand/60 bg-card py-0 soft-paper-shadow transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={image}
          alt={`${trip.name} trip image`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 rounded-md bg-olive px-3 text-cream">
          OPEN
        </Badge>
      </div>
      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        <h3 className="min-h-14 font-display text-2xl font-bold leading-7">
          {trip.name}
        </h3>
        <div className="space-y-2 text-sm text-ink/75">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-ink" />
            {trip.destination}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-ink" />
            {formatDate(trip.start_date)} to {formatDate(trip.end_date)}
          </p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold">
            {formatMoney(trip.price)}
            <span className="ml-2 font-sans text-xs font-normal text-ink/55">
              incl. GST
            </span>
          </p>
          <p className="mt-3 min-h-12 text-sm leading-6 text-ink/75">
            {trip.description}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Users className="size-4" />
            Only {trip.total_seats} seats left
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 rounded-md border-sand/70 bg-card px-4 text-xs font-semibold shadow-sm hover:bg-cream"
          >
            <a href={`#enquiry&trip=${trip.id}`}>I&apos;m Interested</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="relative bg-[#23240e] text-cream">
      <FooterTornEdge />
      <div className="paper-noise relative mx-auto max-w-[1440px] px-4 pb-8 pt-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="relative z-10 grid gap-10 md:grid-cols-2 xl:grid-cols-[1.6fr_0.7fr_0.8fr_1.7fr]">
          <div>
            <Link href="/" className="inline-block leading-none">
              <Image
                src="/images/nomichi-logo-rust.svg"
                alt="Nomichi"
                width={170}
                height={43}
                className="h-auto w-36"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-cream/78">
              Slow travel. Real connections.
              <br />
              Journeys that stay with you.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {([
                [Camera, "Instagram"],
                [MessageCircle, "WhatsApp"],
                [Play, "YouTube"],
                [Mail, "Email"],
              ] as Array<[IconComponent, string]>).map(([Icon, label]) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-8 place-items-center rounded-full bg-cream/10 text-cream/80 transition-colors duration-300 ease-out hover:bg-yellow hover:text-olive"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Company"
            links={["About Nomichi", "How it works", "Our story", "Reviews"]}
          />
          <FooterColumn
            title="Support"
            links={["FAQs", "Terms & Conditions", "Privacy Policy", "Contact Us"]}
          />

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">
              Stay in the loop
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-cream/78">
              Get travel stories, trip updates
              <br />
              and early access.
            </p>
            <form className="mt-5 flex h-12 max-w-sm overflow-hidden rounded-md border border-sand/70 shadow-sm">
              <label className="sr-only" htmlFor="footer-email">
                Enter your email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-cream placeholder:text-cream/55 outline-none transition-colors duration-300 ease-out focus:bg-cream/5"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid w-14 cursor-pointer place-items-center bg-primary text-cream transition-colors duration-300 ease-out hover:bg-yellow hover:text-olive"
              >
                <ArrowRight className="size-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-col gap-4 border-t border-cream/12 pt-5 text-xs text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2025 Nomichi Travels Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with
            <Heart className="size-3 fill-primary text-primary" />
            for mindful travellers.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FinalCta() {
  return (
    <section className="w-full border-t border-sand/55 bg-cream">
      <div className="relative overflow-hidden">
        <Image
          src="/images/hero-girl.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,27,26,0.9)_0%,rgba(28,27,26,0.82)_38%,rgba(69,71,29,0.62)_62%,rgba(28,27,26,0.18)_100%)]" />
        <Image
          src="/images/hills-sun-birds.png"
          alt=""
          width={550}
          height={250}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-[1] w-[360px] max-w-none select-none opacity-75 mix-blend-screen sm:w-[460px]"
        />
        <div className="relative z-10 mx-auto grid min-h-[350px] max-w-[1440px] items-center gap-8 px-4 py-12 sm:px-6 lg:px-8 xl:grid-cols-[1fr_auto] xl:px-10">
          <div className="max-w-2xl lg:pb-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">
              Travel that finds you
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-cream sm:text-5xl">
              Tell us what kind of journey you are hoping for.
            </h2>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-cream/92 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-base">
              Share a few details and the Nomichi team will help you find the
              trip that fits your pace, people, and season.
            </p>
          </div>
          <Button
            asChild
            className="h-16 w-fit rounded-md bg-primary px-12 text-lg font-extrabold text-cream shadow-lg shadow-ink/20 hover:bg-ink"
          >
            <a href="#enquiry">
              Send Enquiry
              <ArrowRight className="size-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">
        {title}
      </h2>
      <nav className="mt-4 grid gap-3 text-sm text-cream/78">
        {links.map((link) => (
          <a key={link} href="#" className="transition-colors duration-300 ease-out hover:text-yellow">
            {link}
          </a>
        ))}
      </nav>
    </div>
  )
}

function FooterTornEdge() {
  return (
    <svg
      className="absolute inset-x-0 -top-8 z-30 h-9 w-full text-[#23240e]"
      viewBox="0 0 1440 52"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 20L60 19C120 18 240 16 360 19C480 22 600 30 720 27C840 24 960 10 1080 11C1200 12 1320 28 1380 29L1440 30V52H0V20Z"
      />
      <path
        fill="currentColor"
        opacity="0.95"
        d="M0 24L80 21C160 18 320 12 480 17C640 22 800 38 960 34C1120 30 1280 7 1360 9L1440 11V52H0V24Z"
      />
    </svg>
  )
}
