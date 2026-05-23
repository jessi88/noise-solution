import * as d3 from "d3"
import type { DashboardDataRow } from "@/hooks/useDashboardData"

type ParticipantJourneyMapProps = {
  rows: DashboardDataRow[]
}

type ParticipantJourney = {
  uin: number | string | null
  first: number
  latest: number
  sessions: number
  change: number
}

function getParticipantJourneys(
  rows: DashboardDataRow[]
): ParticipantJourney[] {
  return Array.from(
    d3.group(
      rows.filter((d) => d.sessionNumber !== null && d.confidence !== null),
      (d) => d.UIN
    )
  )
    .map(([uin, values]) => {
      const sorted = [...values].sort(
        (a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0)
      )

      const first = sorted[0]?.confidence ?? 0
      const latest = sorted[sorted.length - 1]?.confidence ?? 0

      return {
        uin,
        first,
        latest,
        sessions: sorted.length,
        change: latest - first,
      }
    })
    .filter((d) => d.sessions > 1)
}

export default function ParticipantJourneyMap({
  rows,
}: ParticipantJourneyMapProps) {
  const journeys = getParticipantJourneys(rows)

  const increasedCount = journeys.filter((d) => d.change > 0.15).length
  const steadyCount = journeys.filter(
    (d) => d.change >= -0.15 && d.change <= 0.15
  ).length
  const decreasedCount = journeys.filter((d) => d.change < -0.15).length

  const increased = journeys
    .filter((d) => d.change > 0.15)
    .sort((a, b) => b.change - a.change)
    .slice(0, 2)

  const steady = journeys
    .filter((d) => d.change >= -0.15 && d.change <= 0.15)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 2)

  const decreased = journeys
    .filter((d) => d.change < -0.15)
    .sort((a, b) => a.change - b.change)
    .slice(0, 2)

  return (
    <div className="rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6">
      <p className="text-base font-semibold sm:text-lg">
        Journeys are varied, not linear
      </p>
      <div className="mt-6 max-w-7xl">
        <p className="text-sm leading-relaxed font-medium text-white/65 sm:text-base">
          Participant experiences move in different directions over time. Some
          young people describe growing confidence, while others show periods of
          challenge, fluctuation, or stability.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-2xl font-semibold text-acid sm:text-3xl">
              {increasedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-white/65">increased</p>
          </div>

          <div>
            <p className="text-2xl font-semibold text-acid sm:text-3xl">
              {steadyCount}
            </p>
            <p className="mt-1 text-sm font-medium text-white/65">
              broadly steady
            </p>
          </div>

          <div>
            <p className="text-2xl font-semibold text-acid sm:text-3xl">
              {decreasedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-white/65">decreased</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed font-medium text-white/65 sm:text-base">
          These examples highlight movement and variation rather than ranking
          young people or reducing journeys to a single before-and-after result.
        </p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { title: "Increase", items: increased },
          { title: "Steady", items: steady },
          { title: "Decrease", items: decreased },
        ].map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-white/35 uppercase">
              {group.title}
            </p>

            <div className="space-y-3">
              {group.items.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-white/50">
                  No examples in this category.
                </p>
              )}
              {group.items.map((d) => {
                return (
                  <div
                    key={String(d.uin)}
                    className="rounded-2xl border border-white/20 bg-white/6 p-3 sm:p-4"
                  >
                    <p className="text-sm font-semibold sm:text-base">
                      Participant {String(d.uin).slice(-4)}
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/70">
                      First {d.first.toFixed(1)} → latest {d.latest.toFixed(1)}{" "}
                      across {d.sessions} sessions
                    </p>

                    <p className="mt-1 text-xs font-medium text-white/50">
                      Change: {d.change > 0 ? "+" : ""}
                      {d.change.toFixed(1)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
