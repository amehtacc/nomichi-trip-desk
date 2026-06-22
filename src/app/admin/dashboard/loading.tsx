export default function DashboardLoading() {
  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-10 w-72 animate-pulse rounded-md bg-sand/35" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded-md bg-sand/25" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-md bg-sand/30" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg border border-sand/45 bg-card"
          />
        ))}
      </section>

      <section className="h-80 animate-pulse rounded-lg border border-sand/45 bg-card" />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="h-72 animate-pulse rounded-lg border border-sand/45 bg-card" />
        <div className="h-72 animate-pulse rounded-lg border border-sand/45 bg-card" />
      </section>
    </>
  )
}
