import * as d3 from "d3"
import { useState } from "react"
import { useInView } from "@/hooks/useInView"
import type { DashboardDataRow } from "@/hooks/useDashboardData"

type SectorPatternsProps = {
  rows: DashboardDataRow[]
}

const mean = (values: Array<number | null | undefined>) =>
  d3.mean(values.filter((v): v is number => typeof v === "number")) ?? 0

export default function SectorPatterns({ rows }: SectorPatternsProps) {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    label: string
    color: string
  } | null>(null)

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
    <div
      ref={viewRef}
      className="rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6"
    >
      <p className="text-base font-semibold sm:text-lg">
        Different patterns by referral sector
      </p>

      <div className="relative mt-6 space-y-5">
        <div className="mb-5 hidden md:grid md:grid-cols-[150px_1fr] md:gap-5 lg:grid-cols-[170px_1fr]">
          <div />

          <div className="relative h-8">
            {[0, 1, 3, 5, 7, 9].map((tick) => (
              <span
                key={tick}
                className="absolute top-0 -translate-x-1/2 text-xs font-medium text-white/40"
                style={{ left: `${(tick / 9) * 100}%` }}
              >
                {tick}
              </span>
            ))}

            <div className="absolute top-6 right-0 left-0 h-px bg-white/10" />
          </div>
        </div>
        {data.map((d, index) => (
          <div
            key={d.sector}
            className="space-y-3 md:grid md:grid-cols-[150px_1fr] md:gap-5 md:space-y-0 lg:grid-cols-[170px_1fr]"
          >
            <p className="text-sm font-medium text-white/65">
              {d.sector} · {d.n} sessions
            </p>

            <div className="space-y-2">
              <div
                className={
                  isInView
                    ? "sector-bar h-2.5 cursor-pointer rounded-full bg-acid hover:drop-shadow-[0_0_8px_rgba(190,255,0,0.8)]"
                    : "h-2.5 cursor-pointer rounded-full bg-acid hover:drop-shadow-[0_0_8px_rgba(190,255,0,0.8)]"
                }
                style={{
                  width: `${Math.max(4, (d.confidence / 9) * 100)}%`,
                  animationDelay: `${index * 80}ms`,
                }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    label: `${d.sector} · confidence · ${d.confidence.toFixed(1)} / 9`,
                    color: "var(--color-acid)",
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />

              <div
                className={
                  isInView
                    ? "sector-bar h-2.5 cursor-pointer rounded-full bg-violet hover:drop-shadow-[0_0_12px_rgba(167,139,250,1)]"
                    : "h-2.5 cursor-pointer rounded-full bg-violet hover:drop-shadow-[0_0_12px_rgba(167,139,250,1)]"
                }
                style={{ width: `${Math.max(4, (d.control / 9) * 100)}%` }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    label: `${d.sector} · control · ${d.control.toFixed(1)} / 9`,
                    color: "var(--color-violet)",
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />

              <div
                className={
                  isInView
                    ? "sector-bar h-2.5 cursor-pointer rounded-full bg-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    : "h-2.5 cursor-pointer rounded-full bg-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                }
                style={{ width: `${Math.max(4, (d.connection / 9) * 100)}%` }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    label: `${d.sector} · connection · ${d.connection.toFixed(1)} / 9`,
                    color: "var(--color-white)",
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            </div>
          </div>
        ))}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-nowrap shadow-2xl"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 12,
              color: tooltip.color,
            }}
          >
            {tooltip.label}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-white/60">
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-acid" />
          Confidence
        </span>

        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-violet" />
          Control
        </span>

        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-white" />
          Connection
        </span>
      </div>
      <p className="mt-6 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
        Each row shows average confidence, control, and connection scores by
        referral sector. Longer bars indicate higher average scores.
      </p>
    </div>
  )
}
