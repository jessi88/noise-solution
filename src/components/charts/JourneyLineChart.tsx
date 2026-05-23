import { useRef, useState } from "react"
import * as d3 from "d3"
import type { DashboardDataRow } from "@/hooks/useDashboardData"
import { useDimensions } from "@/hooks/useDimensions"
import { useInView } from "@/hooks/useInView"

type SeriesKey = "confidence" | "control" | "connection"

type SeriesItem = {
  key: SeriesKey
  label: string
  color: string
}

type TrendPoint = {
  session: number
  value: number
}

type JourneyLineChartProps = {
  rows: DashboardDataRow[]
}

const series: SeriesItem[] = [
  { key: "confidence", label: "Feeling confident", color: "var(--color-acid)" },
  { key: "control", label: "Feeling in control", color: "var(--color-violet)" },
  {
    key: "connection",
    label: "Feeling connected",
    color: "var(--color-white)",
  },
]

export default function JourneyLineChart({ rows }: JourneyLineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth } = useDimensions(containerRef)
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()

  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    label: string
    color: string
  } | null>(null)

  const hasMeasured = containerWidth > 0
  const width = Math.max(containerWidth, 320)

  const height = width < 640 ? 260 : width < 900 ? 320 : 360

  const maxSession = d3.max(rows, (d) => d.sessionNumber ?? 0) ?? 10

  const leftPad = width < 640 ? 64 : 70
  const rightPad = width < 640 ? 120 : 170

  const x = d3
    .scaleLinear()
    .domain([1, maxSession])
    .range([leftPad, width - rightPad])

  const y = d3
    .scaleLinear()
    .domain([1, 9])
    .range([height - 55, 35])

  const makeData = (key: SeriesKey): TrendPoint[] =>
    d3
      .rollups(
        rows.filter((d) => d.sessionNumber !== null && d[key] !== null),
        (v) => d3.mean(v, (d) => d[key] ?? 0) ?? 0,
        (d) => d.sessionNumber as number
      )
      .map(([session, value]) => ({ session, value }))
      .sort((a, b) => a.session - b.session)

  const line = d3
    .line<TrendPoint>()
    .x((d) => x(d.session))
    .y((d) => y(d.value))
    .curve(d3.curveLinear)

  const xTickStep = width < 480 ? 4 : width < 720 ? 3 : width < 1100 ? 2 : 1

  return (
    <div
      ref={(node) => {
        containerRef.current = node
        viewRef.current = node
      }}
      className="rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6"
    >
      <p className="text-base font-semibold sm:text-lg">
        Average journey by participant session number
      </p>

      {hasMeasured ? (
        <div className="relative mt-5">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
            {[1, 3, 5, 7, 9].map((t) => (
              <g key={t}>
                <line
                  x1={leftPad}
                  x2={width - rightPad}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="white"
                  opacity="0.35"
                />

                <text
                  x={leftPad - 36}
                  y={y(t) + 5}
                  fill="white"
                  opacity="0.55"
                  fontSize={width < 640 ? "11" : "13"}
                >
                  {t}
                </text>
              </g>
            ))}

            {series.map(({ key, color, label }) => {
              const data = makeData(key)
              const last = data[data.length - 1]

              return (
                <g key={key}>
                  <path
                    d={line(data) ?? undefined}
                    fill="none"
                    stroke={color}
                    strokeWidth={width < 640 ? "2" : "3"}
                    strokeLinecap="round"
                    data-series={key}
                    className={
                      isInView
                        ? "journey-line journey-line-animate"
                        : "journey-line"
                    }
                    style={{
                      animationDelay:
                        key === "confidence"
                          ? "0ms"
                          : key === "control"
                            ? "250ms"
                            : "500ms",
                    }}
                  >
                    <title>{label}: average journey line</title>
                  </path>

                  {data.map((d) => (
                    <circle
                      key={`${key}-${d.session}`}
                      cx={x(d.session)}
                      cy={y(d.value)}
                      r={width < 640 ? "2" : "3"}
                      fill={color}
                      data-series={key}
                      className="journey-dot"
                      onMouseEnter={() => {
                        setTooltip({
                          x: x(d.session),
                          y: y(d.value),
                          label: `${
                            width < 640
                              ? key === "confidence"
                                ? "Confidence"
                                : key === "control"
                                  ? "Control"
                                  : "Connected"
                              : label
                          } · session ${d.session} · ${d.value.toFixed(1)} / 9`,
                          color,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                  {last && (
                    <text
                      x={x(last.session) + (width < 640 ? 6 : 12)}
                      y={y(last.value) + 4}
                      fill={color}
                      fontSize={width < 640 ? "11" : "13"}
                      fontWeight="700"
                      opacity="0.9"
                    >
                      {width < 640 && key === "control"
                        ? "Control"
                        : width < 640 && key === "connection"
                          ? "Connected"
                          : width < 640 && key === "confidence"
                            ? "Confidence"
                            : label}
                    </text>
                  )}
                </g>
              )
            })}

            {makeData("confidence")
              .filter((_, i) => i % xTickStep === 0)
              .map((d) => (
                <text
                  key={d.session}
                  x={x(d.session)}
                  y={height - 25}
                  fill="white"
                  opacity="0.45"
                  fontSize={width < 640 ? "11" : "13"}
                  textAnchor="middle"
                >
                  {d.session}
                </text>
              ))}

            <text
              x={leftPad}
              y={height}
              fill="white"
              opacity="0.45"
              fontSize={width < 640 ? "11" : "13"}
              dx="-0.3em"
              letterSpacing="0.08em"
              textAnchor="start"
            >
              PARTICIPANT SESSION NUMBER
            </text>
          </svg>
          {tooltip && (
            <div
              className="pointer-events-none absolute max-w-55 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-normal shadow-2xl sm:max-w-none sm:whitespace-nowrap"
              style={{
                left: tooltip.x,
                top: tooltip.y - 44,
                transform: "translateX(-50%)",
                color: tooltip.color,
              }}
            >
              {tooltip.label}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 h-80 w-full rounded-3xl bg-white/5" />
      )}

      <p className="mt-5 max-w-7xl text-base leading-relaxed font-medium text-white/70">
        Shown as session-number averages. Later session numbers are based on
        fewer young people, so they should be read as directional patterns, not
        exact predictions.
      </p>
    </div>
  )
}
