import * as d3 from "d3"
import { useRef, useState } from "react"
import { useDimensions } from "@/hooks/useDimensions"
import type { DashboardDataRow } from "@/hooks/useDashboardData"
import { useInView } from "@/hooks/useInView"

type ProgrammeWaveformProps = {
  rows: DashboardDataRow[]
}

type MetricKey = "confidence" | "control" | "connection"

const metricSeries: {
  key: MetricKey
  label: string
  color: string
}[] = [
  {
    key: "confidence",
    label: "Feeling confident",
    color: "var(--color-acid)",
  },
  {
    key: "control",
    label: "Feeling in control",
    color: "var(--color-violet)",
  },
  {
    key: "connection",
    label: "Feeling connected",
    color: "var(--color-white)",
  },
]

const mean = (values: Array<number | null | undefined>) =>
  d3.mean(values.filter((v): v is number => typeof v === "number")) ?? 0

const score = (row: DashboardDataRow) =>
  mean([row.confidence, row.control, row.connection])

function sessionRowsByNumber(rows: DashboardDataRow[]) {
  return d3
    .rollups(
      rows.filter((d) => d.sessionNumber !== null),
      (values) => ({
        session: values[0].sessionNumber ?? 0,
        confidence: mean(values.map((d) => d.confidence)),
        control: mean(values.map((d) => d.control)),
        connection: mean(values.map((d) => d.connection)),
      }),
      (d) => d.sessionNumber as number
    )
    .map(([, value]) => value)
    .sort((a, b) => a.session - b.session)
    .slice(0, 24)
}

function SoundCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6`}
    >
      {children}
    </div>
  )
}

function shortLabel(key: MetricKey, label: string, width: number) {
  if (width >= 640) return label
  if (key === "confidence") return "Confidence"
  if (key === "control") return "Control"
  return "Connected"
}

function ProgrammeWave({ rows }: ProgrammeWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth } = useDimensions(containerRef)
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()

  const [tooltip, setTooltip] = useState<{
    xPct: number
    yPct: number
    label: string
    color: string
  } | null>(null)

  const hasMeasured = containerWidth > 0
  const width = Math.max(containerWidth, 320)
  const height = width < 640 ? 280 : width < 900 ? 320 : 360

  const bases = [height * 0.32, height * 0.52, height * 0.72]

  const pad = width < 640 ? 34 : 42
  const tickStep = width < 480 ? 4 : width < 720 ? 3 : 2
  const tickFontSize = width < 640 ? 10 : 13
  const axisFontSize = width < 640 ? 10 : 13

  const data = sessionRowsByNumber(rows)

  const x = (i: number) =>
    pad + i * ((width - pad * 2) / Math.max(1, data.length - 1))

  return (
    <div
      ref={(node) => {
        containerRef.current = node
        viewRef.current = node
      }}
    >
      <SoundCard>
        <p className="text-base font-semibold sm:text-lg">
          Programme waveform: confidence, control, and connection across
          sessions
        </p>

        {hasMeasured ? (
          <div className="relative mt-4">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-auto w-full rounded-3xl bg-black/20"
              role="img"
              aria-label="Programme waveform showing outcome journeys"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {metricSeries.map((series, seriesIndex) => {
                const base = bases[seriesIndex]
                const top: string[] = []
                const bottom: string[] = []

                data.forEach((row, i) => {
                  const value = row[series.key] ?? 0
                  const y = base - (value - 4.5) * 11
                  const amp = 18 + (value / 9) * 14

                  top.push(`${x(i)},${y - amp}`)
                  bottom.unshift(`${x(i)},${y + amp}`)
                })

                const linePoints = data
                  .map((row, i) => {
                    const value = row[series.key] ?? 0
                    const y = base - (value - 4.5) * 11
                    return `${x(i)},${y}`
                  })
                  .join(" ")

                return (
                  <g key={series.key}>
                    <path
                      d={`M ${top.join(" L ")} L ${bottom.join(" L ")} Z`}
                      fill={series.color}
                      opacity="0.14"
                    />

                    <polyline
                      className={
                        isInView
                          ? "programme-wave-line programme-wave-line-animate"
                          : "programme-wave-line"
                      }
                      points={linePoints}
                      fill="none"
                      stroke={series.color}
                      strokeWidth={width < 640 ? "2.5" : "3.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                      style={{ animationDelay: `${seriesIndex * 250}ms` }}
                    />

                    <text
                      x={pad}
                      y={base - 54}
                      fill={series.color}
                      fontSize={width < 640 ? "11" : "15"}
                      fontWeight="700"
                    >
                      {shortLabel(series.key, series.label, width)}
                    </text>

                    {data.map((row, i) => {
                      const value = row[series.key] ?? 0
                      const y = base - (value - 4.5) * 11
                      const rawXPct = (x(i) / width) * 100
                      const rawYPct = (y / height) * 100

                      return (
                        <circle
                          key={`${series.key}-${row.session}`}
                          cx={x(i)}
                          cy={y}
                          r={width < 640 ? "8" : "10"}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            setTooltip({
                              xPct: Math.max(12, Math.min(88, rawXPct)),
                              yPct: rawYPct,
                              label: `${shortLabel(
                                series.key,
                                series.label,
                                width
                              )} · session ${row.session} · ${value.toFixed(
                                1
                              )} / 9`,
                              color: series.color,
                            })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      )
                    })}
                  </g>
                )
              })}

              <line
                x1={pad}
                x2={width - pad}
                y1={height - 34}
                y2={height - 34}
                stroke="rgba(255,255,255,.18)"
                strokeWidth="1"
              />

              {data.map((row, i) =>
                i % tickStep === 0 ? (
                  <g key={row.session}>
                    <line
                      x1={x(i)}
                      x2={x(i)}
                      y1={height - 34}
                      y2={height - 24}
                      stroke="rgba(255,255,255,.35)"
                    />

                    <text
                      x={x(i)}
                      y={height - 14}
                      textAnchor="middle"
                      fill="rgba(255,255,255,.65)"
                      fontSize={tickFontSize}
                    >
                      {row.session}
                    </text>
                  </g>
                ) : null
              )}

              <text
                x={pad}
                y={height + 18}
                textAnchor="start"
                fill="rgba(255,255,255,.45)"
                fontSize={axisFontSize}
                letterSpacing="0.08em"
              >
                PARTICIPANT SESSION NUMBER
              </text>
            </svg>

            {tooltip && (
              <div
                className="pointer-events-none absolute max-w-55 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-normal shadow-2xl sm:max-w-none sm:whitespace-nowrap"
                style={{
                  left: `${tooltip.xPct}%`,
                  top: `${tooltip.yPct}%`,
                  transform: "translate(-50%, -130%)",
                  color: tooltip.color,
                }}
              >
                {tooltip.label}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 h-80 w-full rounded-3xl bg-white/5" />
        )}

        <div className="mt-5 px-0 text-sm font-medium text-white/60 sm:px-10">
          Each wave reflects confidence, control, or connection over time.
          Higher waves indicate stronger average scores.
        </div>
      </SoundCard>
    </div>
  )
}

function ImpactEqualiser({ rows }: ProgrammeWaveformProps) {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()

  const barWidth = 64
  const gap = 8

  const values = [
    {
      label: "Confidence",
      value: mean(rows.map((d) => d.confidence)),
      color: "var(--color-acid)",
    },
    {
      label: "Control",
      value: mean(rows.map((d) => d.control)),
      color: "var(--color-violet)",
    },
    {
      label: "Connected",
      value: mean(rows.map((d) => d.connection)),
      color: "var(--color-white)",
    },
  ]

  return (
    <div>
      <SoundCard>
        <p className="text-lg font-black">Impact equaliser</p>

        <div ref={viewRef} className="mt-8 flex justify-center gap-8">
          {values.map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="flex flex-col-reverse"
                style={{ gap: `${gap}px` }}
              >
                {Array.from({ length: 9 }, (_, i) => {
                  const lit = i < Math.round(item.value)

                  return (
                    <div
                      key={`${i}-${isInView}`}
                      className={
                        isInView
                          ? "equaliser-bar h-4 rounded-full"
                          : "h-4 rounded-full"
                      }
                      style={
                        {
                          width: `${barWidth}px`,
                          background: item.color,
                          opacity: isInView ? undefined : lit ? 0.95 : 0.12,
                          "--bar-opacity": lit ? 0.95 : 0.12,
                          animationDelay: `${i * 60}ms`,
                        } as React.CSSProperties
                      }
                    />
                  )
                })}
              </div>

              <p className="mt-4 text-sm font-black">{item.label}</p>

              <p className="text-xl font-black" style={{ color: item.color }}>
                {item.value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-relaxed font-bold text-white/70">
          A music-inspired view of the headline scores. It avoids false
          precision and makes the balance between outcomes easy to grasp.
        </p>
      </SoundCard>
    </div>
  )
}

function VoiceConstellation({ rows }: ProgrammeWaveformProps) {
  const width = 760
  const height = 390

  const sample = rows
    .filter(
      (d) =>
        d.sessionNumber !== null &&
        typeof d["Most Positive Sentence Overall"] === "string"
    )
    .slice(0, 140)

  const pad = {
    l: width < 640 ? 36 : 48,
    r: 24,
    t: 24,
    b: 44,
  }

  const maxSession = d3.max(sample, (d) => d.sessionNumber ?? 1) ?? 1

  const x = (value: number) =>
    pad.l + ((value - 1) / (maxSession - 1 || 1)) * (width - pad.l - pad.r)

  const y = (value: number) =>
    height - pad.b - (value / 9) * (height - pad.t - pad.b)

  return (
    <div>
      <SoundCard>
        <p className="text-lg font-black">Constellation of voices</p>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-4 h-auto w-full"
          role="img"
          aria-label="Constellation of voice-linked sessions"
        >
          <defs>
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[1, 3, 5, 7, 9].map((tick) => (
            <g key={tick}>
              <line
                x1={pad.l}
                x2={width - pad.r}
                y1={y(tick)}
                y2={y(tick)}
                stroke="rgba(255,255,255,.12)"
              />
              <text
                x={pad.l - 12}
                y={y(tick) + 4}
                textAnchor="end"
                fill="rgba(255,255,255,.58)"
                fontSize="11"
              >
                {tick}
              </text>
            </g>
          ))}

          {sample.map((d, i) => {
            const s = score(d)
            const radius = 3.5 + Math.max(0, s - 4) * 0.75
            const color =
              (d.connection ?? 0) >= (d.confidence ?? 0)
                ? "var(--color-violet)"
                : "var(--color-acid)"

            return (
              <circle
                key={`${d.UIN}-${d.ID}-${i}`}
                cx={x(d.sessionNumber ?? 1)}
                cy={y(s)}
                r={radius}
                fill={color}
                opacity="0.72"
                filter="url(#dotGlow)"
              >
                <title>
                  Session {d.sessionNumber} · {s.toFixed(1)}/9:{" "}
                  {String(d["Most Positive Sentence Overall"]).slice(0, 110)}
                </title>
              </circle>
            )
          })}

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,.65)"
            fontSize="12"
          >
            Journey stage
          </text>

          <text
            transform={`translate(15 ${height / 2}) rotate(-90)`}
            textAnchor="middle"
            fill="rgba(255,255,255,.65)"
            fontSize="12"
          >
            Overall strength of session reflection
          </text>
        </svg>

        <p className="mt-4 text-base leading-relaxed font-bold text-white/70">
          Each dot is a session with participant voice attached. Brighter
          clusters show where strong scores and reflective statements appear
          together.
        </p>
      </SoundCard>
    </div>
  )
}

function ParticipantTracks({ rows }: ProgrammeWaveformProps) {
  const journeys = Array.from(d3.group(rows, (d) => d.UIN))
    .map(([uin, values]) => {
      const sorted = values
        .filter((d) => d.sessionNumber !== null)
        .sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0))

      if (sorted.length < 4) return null

      return {
        uin,
        rows: sorted,
        change: score(sorted[sorted.length - 1]) - score(sorted[0]),
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5)

  return (
    <SoundCard>
      <p className="text-lg font-black">
        Participant mixtape: journeys as tracks
      </p>

      <div className="mt-5 space-y-4">
        {journeys.map((journey) => {
          const width = 420
          const height = 88
          const pad = 12
          const mid = height / 2

          const x = (i: number) =>
            pad + i * ((width - pad * 2) / Math.max(1, journey.rows.length - 1))

          const top: string[] = []
          const bottom: string[] = []

          journey.rows.forEach((row, i) => {
            const s = score(row)
            const amp = 6 + (s / 9) * 26
            const wobble = Math.sin(i * 1.4) * 5

            top.push(`${x(i)},${mid - amp + wobble}`)
            bottom.unshift(`${x(i)},${mid + amp + wobble}`)
          })

          const linePoints = journey.rows
            .map((row, i) => {
              const s = score(row)
              return `${x(i)},${mid - (s - 4.5) * 6}`
            })
            .join(" ")

          const direction =
            journey.change > 0.15
              ? "rising track"
              : journey.change < -0.15
                ? "complex track"
                : "steady track"

          return (
            <div
              key={String(journey.uin)}
              className="grid grid-cols-[130px_1fr] items-center gap-4"
            >
              <div>
                <p className="font-black text-acid">
                  Participant {String(journey.uin).slice(-4)}
                </p>
                <p className="text-sm font-bold text-white/70">
                  {direction}
                  <br />
                  {journey.rows.length} sessions · {journey.change.toFixed(1)}{" "}
                  change
                </p>
              </div>

              <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
                <path
                  d={`M ${top.join(" L ")} L ${bottom.join(" L ")} Z`}
                  fill="var(--color-acid)"
                  opacity="0.18"
                />
                <polyline
                  className="waveform-glow"
                  points={linePoints}
                  fill="none"
                  stroke="var(--color-acid)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-base leading-relaxed font-bold text-white/70">
        Each mini-wave is one anonymised participant’s journey. The form makes
        difference visible without ranking young people.
      </p>
    </SoundCard>
  )
}

function OrbitalScore({
  rows,
  metric,
  title,
  description,
  color,
}: {
  rows: DashboardDataRow[]
  metric: MetricKey
  title: string
  description: string
  color: string
}) {
  const values = rows
    .map((d) => d[metric])
    .filter((v): v is number => typeof v === "number")

  const bins = Array.from(
    { length: 9 },
    (_, i) => values.filter((v) => Math.round(v) === i + 1).length
  )

  const max = Math.max(...bins, 1)
  const width = 300
  const height = 260
  const cx = 150
  const cy = 126

  return (
    <SoundCard>
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {bins.map((count, i) => {
          const angle = (-90 + i * 40) * (Math.PI / 180)
          const r1 = 42
          const r2 = 68 + (count / max) * 74

          const x1 = cx + Math.cos(angle) * r1
          const y1 = cy + Math.sin(angle) * r1
          const x2 = cx + Math.cos(angle) * r2
          const y2 = cy + Math.sin(angle) * r2

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="9"
                strokeLinecap="round"
                opacity="0.9"
              />
              <text
                x={cx + Math.cos(angle) * (r2 + 18)}
                y={cy + Math.sin(angle) * (r2 + 18) + 4}
                textAnchor="middle"
                fill="rgba(255,255,255,.62)"
                fontSize="11"
              >
                {i + 1}
              </text>
            </g>
          )
        })}

        <circle
          cx={cx}
          cy={cy}
          r="38"
          fill="rgba(255,255,255,.04)"
          stroke="rgba(255,255,255,.18)"
        />

        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill={color}
          fontSize="26"
          fontWeight="900"
        >
          {mean(values).toFixed(1)}
        </text>
      </svg>

      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-3 text-base leading-relaxed font-bold text-white/70">
        {description}
      </p>
    </SoundCard>
  )
}

export default function ProgrammeWaveform({ rows }: ProgrammeWaveformProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ProgrammeWave rows={rows} />
        <ImpactEqualiser rows={rows} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <VoiceConstellation rows={rows} />
        <ParticipantTracks rows={rows} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <OrbitalScore
          rows={rows}
          metric="confidence"
          title="Confidence"
          description="A circular “sound ring” showing how confidence scores are distributed across sessions."
          color="var(--color-acid)"
        />

        <OrbitalScore
          rows={rows}
          metric="control"
          title="Feeling in control"
          description="The ring shows variation without labelling lower scores as failure."
          color="var(--color-violet)"
        />

        <OrbitalScore
          rows={rows}
          metric="connection"
          title="Feeling connected"
          description="A relational measure visualised as resonance rather than a league table."
          color="var(--color-white)"
        />
      </div>
    </div>
  )
}
