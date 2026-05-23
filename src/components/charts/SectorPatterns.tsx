import * as d3 from "d3"
import type { DashboardDataRow } from "@/hooks/useDashboardData"

type SectorPatternsProps = {
  rows: DashboardDataRow[]
}

const mean = (values: Array<number | null | undefined>) =>
  d3.mean(values.filter((v): v is number => typeof v === "number")) ?? 0

export default function SectorPatterns({ rows }: SectorPatternsProps) {
  const data = Array.from(d3.group(rows, (d) => String(d.Sector || "Unknown")))
    .map(([sector, values]) => ({
      sector,
      n: values.length,
      confidence: mean(values.map((d) => d.confidence)),
      control: mean(values.map((d) => d.control)),
      connection: mean(values.map((d) => d.connection)),
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)

  return (
    <div className="rounded-3xl border border-white/20 bg-white/4 p-6 text-white sm:p-8">
      <p className="text-xl font-black">
        Different patterns by referral sector
      </p>

      <div className="mt-8 space-y-6">
        {data.map((d) => (
          <div
            key={d.sector}
            className="space-y-3 md:grid md:grid-cols-[170px_1fr] md:gap-5 md:space-y-0"
          >
            <p className="text-sm font-bold text-white/70">
              {d.sector} ({d.n})
            </p>

            <div className="space-y-2">
              <div
                className="h-2.5 rounded-full bg-acid"
                style={{ width: `${Math.max(4, (d.confidence / 9) * 100)}%` }}
              />

              <div
                className="h-2.5 rounded-full bg-violet"
                style={{ width: `${Math.max(4, (d.control / 9) * 100)}%` }}
              />

              <div
                className="h-2.5 rounded-full bg-white"
                style={{ width: `${Math.max(4, (d.connection / 9) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-lg leading-relaxed font-bold text-white/70">
        Sector comparisons show where journeys may differ. They should prompt
        questions, not simplistic conclusions.
      </p>
    </div>
  )
}
