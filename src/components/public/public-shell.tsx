import type { ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Play,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import type { Trip } from "@/lib/types"

type IconComponent = ComponentType<{ className?: string }>

const tripImages: Record<string, string> = {
  Kashmir: "/images/trips/kashmir.png",
  Goa: "/images/trips/goa.png",
  "Arunachal Pradesh": "/images/trips/tawang.png",
  Rajasthan: "/images/trips/rajasthan.png",
}

export function PublicTripCard({ trip }: { trip: Trip }) {
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
            <a href={`/#enquiry&trip=${trip.id}`}>I&apos;m Interested</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PublicFooter() {
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

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">
        {title}
      </h2>
      <nav className="mt-4 grid gap-3 text-sm text-cream/78">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="transition-colors duration-300 ease-out hover:text-yellow"
          >
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
