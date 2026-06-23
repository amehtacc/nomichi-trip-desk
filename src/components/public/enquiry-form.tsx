"use client"

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Clock3 } from "lucide-react"
import { createEnquiry } from "@/app/actions"
import { groupTypes } from "@/lib/constants"
import {
  enquirySchema,
  initialActionState,
  type ActionState,
} from "@/lib/schemas"
import type { Trip } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldError } from "@/components/field-error"
import { AutoDismissMessage } from "@/components/auto-dismiss-message"

type EnquiryValues = {
  name: string
  phone: string
  email: string
  trip_id: string
  group_type: string
  preferred_month: string
  expectation?: string
}

const fieldClass =
  "h-11 rounded-md border border-sand/45 bg-cream/95 px-3 text-sm shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"

const selectClass =
  "!h-11 min-h-11 max-h-11 w-full rounded-md border border-sand/45 bg-cream/95 px-3 py-0 text-sm leading-none shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"

const selectContentClass =
  "max-h-44 w-[var(--radix-select-trigger-width)] min-w-0 max-w-[var(--radix-select-trigger-width)]"

const selectItemClass = "whitespace-normal leading-5"

const validationOrder: Array<keyof EnquiryValues> = [
  "name",
  "phone",
  "email",
  "trip_id",
  "group_type",
  "preferred_month",
]

function tripIdFromLocation() {
  const searchTripId = new URLSearchParams(window.location.search).get("trip")
  if (searchTripId) return searchTripId

  const hash = window.location.hash.replace(/^#/, "")
  const hashParams = new URLSearchParams(
    hash.startsWith("enquiry&") ? hash.replace(/^enquiry&/, "") : hash
  )
  return hashParams.get("trip")
}

export function EnquiryForm({
  trips,
  disabled,
}: {
  trips: Trip[]
  disabled: boolean
}) {
  const [state, setState] = useState<ActionState>(initialActionState)
  const [isPending, startTransition] = useTransition()
  const defaultTrip = trips[0]?.id ?? ""
  const [selectedTrip, setSelectedTrip] = useState(defaultTrip)

  const {
    register,
    setValue,
    getValues,
    trigger,
    control,
    reset,
    formState: { errors },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      trip_id: defaultTrip,
      group_type: "",
      preferred_month: "",
      expectation: "",
    },
  })

  const updateSelectedTrip = useCallback(
    (value: string, shouldValidate: boolean) => {
      setSelectedTrip(value)
      setValue("trip_id", value, {
        shouldDirty: shouldValidate,
        shouldTouch: shouldValidate,
        shouldValidate,
      })
    },
    [setValue]
  )

  useEffect(() => {
    if (state.ok) {
      reset({
        name: "",
        phone: "",
        email: "",
        trip_id: defaultTrip,
        group_type: "",
        preferred_month: "",
        expectation: "",
      })
      const timer = window.setTimeout(() => updateSelectedTrip(defaultTrip, false), 0)
      return () => window.clearTimeout(timer)
    }
  }, [defaultTrip, reset, state.ok, updateSelectedTrip])

  useEffect(() => {
    const tripId = tripIdFromLocation()
    const validTripId =
      tripId && trips.some((trip) => trip.id === tripId) ? tripId : defaultTrip

    const timer = window.setTimeout(
      () => updateSelectedTrip(validTripId, Boolean(tripId)),
      0
    )
    return () => window.clearTimeout(timer)
  }, [defaultTrip, trips, updateSelectedTrip])

  useEffect(() => {
    function applyTripFromHash() {
      const tripId = tripIdFromLocation()

      if (tripId && trips.some((trip) => trip.id === tripId)) {
        updateSelectedTrip(tripId, true)
        document.getElementById("enquiry")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }

    applyTripFromHash()
    window.addEventListener("hashchange", applyTripFromHash)
    window.addEventListener("popstate", applyTripFromHash)
    return () => {
      window.removeEventListener("hashchange", applyTripFromHash)
      window.removeEventListener("popstate", applyTripFromHash)
    }
  }, [trips, updateSelectedTrip])

  const fieldMessages = useMemo(() => {
    return state.fieldErrors ?? {}
  }, [state.fieldErrors])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const urlTripId = tripIdFromLocation()
    const validUrlTripId =
      urlTripId && trips.some((trip) => trip.id === urlTripId) ? urlTripId : ""
    const tripForSubmit = selectedTrip || validUrlTripId || defaultTrip

    updateSelectedTrip(tripForSubmit, true)
    setValue("trip_id", tripForSubmit, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })

    for (const field of validationOrder) {
      const isValid = await trigger(field, { shouldFocus: true })
      if (!isValid) return
    }

    const values = { ...getValues(), trip_id: tripForSubmit }
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value ?? "")
    })

    startTransition(async () => {
      setState(await createEnquiry(initialActionState, formData))
    })
  }

  const selectedGroup = useWatch({ control, name: "group_type" })

  return (
    <form
      id="enquiry"
      noValidate
      onSubmit={onSubmit}
      className="paper-noise rounded-lg border border-sand/55 bg-[#efe4d4]/95 p-5 shadow-2xl shadow-ink/12 backdrop-blur-sm"
    >
      <div className="grid content-start gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            Plan your journey
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-none text-ink">
            Send an enquiry<span className="text-primary">.</span>
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold">
              Full Name <span className="text-primary">*</span>
            </span>
            <Input
              {...register("name")}
              placeholder="Your full name"
              aria-invalid={Boolean(errors.name || fieldMessages.name)}
              disabled={disabled || isPending}
              className={fieldClass}
            />
            <FieldError message={errors.name?.message ?? fieldMessages.name?.[0]} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold">
              Phone Number <span className="text-primary">*</span>
            </span>
            <Input
              {...register("phone")}
              placeholder="+91 98765 43210"
              aria-invalid={Boolean(errors.phone || fieldMessages.phone)}
              disabled={disabled || isPending}
              className={fieldClass}
            />
            <FieldError message={errors.phone?.message ?? fieldMessages.phone?.[0]} />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold">
              Email Address <span className="text-primary">*</span>
            </span>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email || fieldMessages.email)}
              disabled={disabled || isPending}
              className={fieldClass}
            />
            <FieldError message={errors.email?.message ?? fieldMessages.email?.[0]} />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold">
              Select Trip <span className="text-primary">*</span>
            </span>
            <Select
              key={selectedTrip || "trip-select"}
              value={selectedTrip || defaultTrip}
              onValueChange={(value) => updateSelectedTrip(value, true)}
              disabled={disabled || isPending || trips.length === 0}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Choose a trip" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                className={selectContentClass}
              >
                {trips.map((trip) => (
                  <SelectItem
                    key={trip.id}
                    value={trip.id}
                    className={selectItemClass}
                  >
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              message={errors.trip_id?.message ?? fieldMessages.trip_id?.[0]}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold">
              Group Type <span className="text-primary">*</span>
            </span>
            <Select
              value={selectedGroup}
              onValueChange={(value) =>
                setValue("group_type", value, { shouldValidate: true })
              }
              disabled={disabled || isPending}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Solo" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                className={selectContentClass}
              >
                {groupTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className={selectItemClass}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              message={errors.group_type?.message ?? fieldMessages.group_type?.[0]}
            />
          </div>

          <label className="space-y-2">
            <span className="text-xs font-bold">
              Preferred Month <span className="text-primary">*</span>
            </span>
            <Input
              {...register("preferred_month")}
              placeholder="June 2025 or winter"
              aria-invalid={Boolean(
                errors.preferred_month || fieldMessages.preferred_month
              )}
              disabled={disabled || isPending}
              className={fieldClass}
            />
            <FieldError
              message={
                errors.preferred_month?.message ??
                fieldMessages.preferred_month?.[0]
              }
            />
          </label>
        </div>

      <label className="space-y-2">
        <span className="text-xs font-bold">
          What are you hoping this trip feels like?
        </span>
        <Textarea
          {...register("expectation")}
          rows={5}
          placeholder="Share a few words about what you are looking for..."
          aria-invalid={Boolean(errors.expectation || fieldMessages.expectation)}
          disabled={disabled || isPending}
          className="min-h-28 rounded-md border border-sand/45 bg-cream/95 px-4 py-3 text-sm shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"
        />
        <FieldError
          message={errors.expectation?.message ?? fieldMessages.expectation?.[0]}
        />
      </label>

      {state.message ? (
        <AutoDismissMessage
          key={`${state.ok}-${state.message}`}
          className={
            state.ok
              ? "rounded-lg border border-olive/25 bg-olive/10 p-4 text-sm leading-6 text-olive"
              : "rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm leading-6 text-destructive"
          }
        >
          {state.message}
        </AutoDismissMessage>
      ) : null}

      <Button
        type="submit"
        className="relative h-12 w-full rounded-md bg-yellow px-4 text-center text-sm font-bold text-ink shadow-sm hover:bg-primary hover:text-cream"
        disabled={disabled || isPending}
      >
        <span className="mx-auto">{isPending ? "Sending enquiry" : "Submit Enquiry"}</span>
        <ArrowRight className="absolute right-4 size-4" />
      </Button>
      <p className="flex items-center justify-center gap-2 text-sm text-ink/68">
        <Clock3 className="size-4" />
        We usually respond within 24 hours.
      </p>
      </div>
    </form>
  )
}
