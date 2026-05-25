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
    <div className="h-full rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6">
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
    align: "left" | "center" | "right"
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
      className="h-full"
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
                  const amp = 8 + (value / 9) * 40
                  const wobble = Math.sin(i * 0.9) * 8

                  top.push(`${x(i)},${y - amp + wobble}`)
                  bottom.unshift(`${x(i)},${y + amp + wobble}`)
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

                      return (
                        <circle
                          key={`${series.key}-${row.session}`}
                          cx={x(i)}
                          cy={y}
                          r={width < 640 ? "8" : "10"}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            const rawXPct = (x(i) / width) * 100
                            const rawYPct = (y / height) * 100

                            setTooltip({
                              xPct:
                                width < 640
                                  ? Math.max(6, Math.min(94, rawXPct))
                                  : rawXPct,
                              yPct: Math.max(14, Math.min(86, rawYPct)),
                              label: `${shortLabel(series.key, series.label, width)} · session ${
                                row.session
                              } · ${value.toFixed(1)} / 9`,
                              color: series.color,
                              align:
                                rawXPct < 25
                                  ? "left"
                                  : rawXPct > 75
                                    ? "right"
                                    : "center",
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
                className="pointer-events-none absolute w-56 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-normal shadow-2xl sm:w-auto sm:whitespace-nowrap"
                style={{
                  left: `${tooltip.xPct}%`,
                  top: `${tooltip.yPct}%`,
                  transform:
                    tooltip.align === "left"
                      ? "translate(0, -130%)"
                      : tooltip.align === "right"
                        ? "translate(-100%, -130%)"
                        : "translate(-50%, -130%)",
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

        <p className="mt-4 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
          Each wave reflects confidence, control, or connection over time.
          Higher waves indicate stronger average scores.
        </p>
      </SoundCard>
    </div>
  )
}

function ImpactEqualiser({ rows }: ProgrammeWaveformProps) {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()

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
    <div className="h-full">
      <SoundCard>
        <p className="text-base font-semibold sm:text-lg">Impact equaliser</p>

        <div ref={viewRef} className="mt-8 flex justify-center gap-4 sm:gap-8">
          {values.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center"
            >
              <div
                className="flex flex-col-reverse items-center"
                style={{ gap: `${gap}px` }}
              >
                {Array.from({ length: 9 }, (_, i) => {
                  const lit = i < Math.round(item.value)

                  return (
                    <div
                      key={`${i}-${isInView}`}
                      className={
                        isInView
                          ? "equaliser-bar h-3 w-10 rounded-full sm:h-4 sm:w-16"
                          : "h-3 w-10 rounded-full sm:h-4 sm:w-16"
                      }
                      style={
                        {
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

              <p className="mt-4 text-xs font-semibold sm:text-sm">
                {item.label}
              </p>

              <p
                className="text-lg font-semibold sm:text-xl"
                style={{ color: item.color }}
              >
                {item.value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
          A music-inspired view of the average scores, showing the balance
          between confidence, control, and connection.
        </p>
      </SoundCard>
    </div>
  )
}

function shortOutcomeLabel(key: string, width: number) {
  if (width >= 640) {
    if (key === "confidence") return "Confidence strongest"
    if (key === "control") return "Control strongest"
    return "Connection strongest"
  }

  if (key === "confidence") return "Confidence"
  if (key === "control") return "Control"
  return "Connected"
}

function tooltipOutcomeLabel(key: string | undefined, width: number) {
  if (key === "confidence") return width < 640 ? "Confidence" : "confidence"
  if (key === "control") return width < 640 ? "Control" : "control"
  return width < 640 ? "Connected" : "connection"
}

function VoiceConstellation({ rows }: ProgrammeWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth } = useDimensions(containerRef)
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()

  const [tooltip, setTooltip] = useState<{
    xPct: number
    yPct: number
    label: string
    color: string
    align: "left" | "center" | "right"
  } | null>(null)

  const hasMeasured = containerWidth > 0
  const width = Math.max(containerWidth, 320)
  const height = width < 640 ? 300 : width < 900 ? 360 : 410

  const sampleLimit = width < 640 ? 70 : 140

  const sample = rows
    .filter(
      (d) =>
        d.sessionNumber !== null &&
        typeof d["Most Positive Sentence Overall"] === "string"
    )
    .slice(0, sampleLimit)

  const pad = {
    l: width < 720 ? 40 : 58,
    r: width < 640 ? 16 : 24,
    t: 24,
    b: width < 640 ? 58 : 68,
  }

  const xTickStep = width < 480 ? 4 : width < 720 ? 3 : width < 1100 ? 2 : 1
  const xTicks = Array.from(
    new Set(sample.map((d) => d.sessionNumber).filter(Boolean))
  ).filter((_, i) => i % xTickStep === 0)
  const axisY = height - 52
  const showYAxisTitle = width >= 720
  const tickLabelY = height - 28

  const maxSession = d3.max(sample, (d) => d.sessionNumber ?? 1) ?? 1

  const x = (value: number) =>
    pad.l + ((value - 1) / (maxSession - 1 || 1)) * (width - pad.l - pad.r)

  const y = (value: number) =>
    height - pad.b - (value / 9) * (height - pad.t - pad.b)

  return (
    <div
      className="h-full"
      ref={(node) => {
        containerRef.current = node
        viewRef.current = node
      }}
    >
      <SoundCard>
        <p className="text-base font-semibold sm:text-lg">
          Constellation of voices
        </p>

        {hasMeasured ? (
          <div className="relative mt-4">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-auto w-full"
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
                    x={pad.l - 10}
                    y={y(tick) + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,.58)"
                    fontSize={width < 640 ? 10 : 13}
                  >
                    {tick}
                  </text>
                </g>
              ))}

              {sample.map((d, i) => {
                const s = score(d)
                const radius =
                  width < 640
                    ? 2.5 + Math.max(0, s - 4) * 0.45
                    : 3.5 + Math.max(0, s - 4) * 0.75

                const strongest = d3.greatest(
                  [
                    { key: "confidence", value: d.confidence ?? 0 },
                    { key: "control", value: d.control ?? 0 },
                    { key: "connection", value: d.connection ?? 0 },
                  ],
                  (d) => d.value
                )?.key

                const color =
                  strongest === "confidence"
                    ? "var(--color-acid)"
                    : strongest === "control"
                      ? "var(--color-violet)"
                      : "rgba(255,255,255,.82)"

                return (
                  <circle
                    key={`${d.UIN}-${d.ID}-${i}-${isInView}`}
                    cx={x(d.sessionNumber ?? 1)}
                    cy={y(s)}
                    r={radius}
                    fill={color}
                    opacity="0.72"
                    filter="url(#dotGlow)"
                    className={
                      isInView
                        ? "constellation-dot-animate cursor-pointer"
                        : "cursor-pointer"
                    }
                    style={{
                      animationDelay: `${((d.sessionNumber ?? 1) - 1) * 70}ms`,
                    }}
                    onMouseEnter={() => {
                      const cx = x(d.sessionNumber ?? 1)
                      const cy = y(s)

                      const rawXPct = (cx / width) * 100

                      setTooltip({
                        xPct:
                          width < 640
                            ? Math.max(6, Math.min(94, rawXPct))
                            : rawXPct,
                        yPct: Math.max(14, Math.min(86, (cy / height) * 100)),
                        label: `Participant ${String(d.UIN).slice(-4)} · session ${
                          d.sessionNumber
                        } · ${s.toFixed(1)} / 9 · strongest: ${tooltipOutcomeLabel(
                          strongest,
                          width
                        )}`,
                        color,
                        align:
                          rawXPct < 25
                            ? "left"
                            : rawXPct > 75
                              ? "right"
                              : "center",
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}

              <line
                x1={pad.l}
                x2={width - pad.r}
                y1={axisY}
                y2={axisY}
                stroke="rgba(255,255,255,.18)"
              />

              {xTicks.map((session) => {
                const sessionNumber = Number(session)

                return (
                  <g key={`x-${sessionNumber}`}>
                    <text
                      x={x(sessionNumber)}
                      y={tickLabelY}
                      textAnchor="middle"
                      fill="rgba(255,255,255,.55)"
                      fontSize={width < 640 ? 10 : 13}
                    >
                      {sessionNumber}
                    </text>
                  </g>
                )
              })}
              <text
                x={pad.l}
                y={height}
                textAnchor="start"
                fill="rgba(255,255,255,.45)"
                fontSize={width < 640 ? 10 : 13}
                dx="-0.3em"
                letterSpacing="0.08em"
              >
                PARTICIPANT SESSION NUMBER
              </text>

              {showYAxisTitle && (
                <text
                  transform={`translate(16 ${y(9)}) rotate(-90)`}
                  textAnchor="end"
                  fill="rgba(255,255,255,.5)"
                  fontSize="11"
                  letterSpacing="0.08em"
                  dx="0.3em"
                >
                  SESSION REFLECTION STRENGTH
                </text>
              )}
            </svg>

            {tooltip && (
              <div
                className="pointer-events-none absolute w-56 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-normal shadow-2xl sm:w-auto sm:whitespace-nowrap"
                style={{
                  left: `${tooltip.xPct}%`,
                  top: `${tooltip.yPct}%`,
                  transform:
                    tooltip.align === "left"
                      ? "translate(0, -130%)"
                      : tooltip.align === "right"
                        ? "translate(-100%, -130%)"
                        : "translate(-50%, -130%)",
                  color: tooltip.color,
                }}
              >
                {tooltip.label}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 h-72 w-full rounded-3xl bg-white/5" />
        )}

        <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-white/60">
          {[
            { key: "confidence", color: "var(--color-acid)" },
            { key: "control", color: "var(--color-violet)" },
            { key: "connection", color: "rgba(255,255,255,.82)" },
          ].map((item) => (
            <span key={item.key} className="flex items-center gap-2">
              <i
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              {shortOutcomeLabel(item.key, width)}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
          Each dot represents a session with participant voice attached. Higher
          and larger dots indicate stronger overall session reflections across
          different stages of the journey. Dot colours reflect whether
          confidence, control, or connection was strongest in that session.
        </p>
      </SoundCard>
    </div>
  )
}

function ParticipantTracks({ rows }: ProgrammeWaveformProps) {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>()
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

  const increased = journeys
    .filter((d) => d.change > 0.15)
    .sort((a, b) => b.change - a.change)
    .slice(0, 2)

  const steady = journeys
    .filter((d) => d.change >= -0.15 && d.change <= 0.15)
    .sort((a, b) => b.rows.length - a.rows.length)
    .slice(0, 2)

  const decreased = journeys
    .filter((d) => d.change < -0.15)
    .sort((a, b) => a.change - b.change)
    .slice(0, 2)

  const featuredJourneys = [...increased, ...steady, ...decreased]

  const [tooltip, setTooltip] = useState<{
    activeTrack: string
    xPct: number
    yPct: number
    label: string
    align: "left" | "center" | "right"
  } | null>(null)

  return (
    <div className="h-full" ref={viewRef}>
      <SoundCard>
        <p className="text-base font-semibold sm:text-lg">
          Participant mixtape: journeys as tracks
        </p>

        <div className="mt-5 space-y-4">
          {featuredJourneys.map((journey, index) => {
            const width = 420
            const height = 88
            const pad = 12
            const mid = height / 2

            const x = (i: number) =>
              pad +
              i * ((width - pad * 2) / Math.max(1, journey.rows.length - 1))

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
                return `${x(i)},${mid - (s - 4.5) * 7}`
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
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/4 p-3 sm:grid-cols-[130px_1fr] sm:items-center sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <div>
                  <p className="text-sm font-semibold text-acid sm:text-base">
                    Participant {String(journey.uin).slice(-4)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-white/65 sm:text-sm">
                    {direction}
                    <br />
                    {journey.rows.length} sessions ·
                    {journey.change >= 0 ? "Δ" : "▽"}{" "}
                    {journey.change > 0 ? "+" : ""}
                    {journey.change.toFixed(1)}
                  </p>
                </div>

                <div className="relative">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-auto w-full"
                  >
                    <path
                      d={`M ${top.join(" L ")} L ${bottom.join(" L ")} Z`}
                      fill="var(--color-acid)"
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
                      stroke="var(--color-acid)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ animationDelay: `${index * 160}ms` }}
                    />
                    {journey.rows.map((row, i) => {
                      const s = score(row)
                      const y = mid - (s - 4.5) * 6
                      const rawXPct = (x(i) / width) * 100
                      const rawYPct = (y / height) * 100

                      return (
                        <circle
                          key={`${journey.uin}-${row.sessionNumber}-${i}`}
                          cx={x(i)}
                          cy={y}
                          r="9"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() =>
                            setTooltip({
                              activeTrack: String(journey.uin),
                              xPct: Math.max(6, Math.min(94, rawXPct)),
                              yPct: Math.max(18, Math.min(86, rawYPct)),
                              label: `Participant ${String(journey.uin).slice(-4)} · session ${
                                row.sessionNumber
                              } · ${s.toFixed(1)} / 9`,
                              align:
                                rawXPct < 25
                                  ? "left"
                                  : rawXPct > 75
                                    ? "right"
                                    : "center",
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />
                      )
                    })}
                  </svg>
                  {tooltip?.activeTrack === String(journey.uin) && (
                    <div
                      className="pointer-events-none absolute w-56 rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs font-semibold whitespace-normal text-acid shadow-2xl sm:w-auto sm:whitespace-nowrap"
                      style={{
                        left: `${tooltip.xPct}%`,
                        top: `${tooltip.yPct}%`,
                        transform:
                          tooltip.align === "left"
                            ? "translate(0, -130%)"
                            : tooltip.align === "right"
                              ? "translate(-100%, -130%)"
                              : "translate(-50%, -130%)",
                      }}
                    >
                      {tooltip.label}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
          Each mini-wave is one anonymised participant journey. The form makes
          movement visible without ranking young people.
        </p>
      </SoundCard>
    </div>
  )
}

function OrbitalScore({
  rows,
  metric,
  title,
  color,
}: {
  rows: DashboardDataRow[]
  metric: MetricKey
  title: string
  color: string
}) {
  const { ref, isInView } = useInView<HTMLDivElement>()

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
  const cy = 100

  return (
    <div ref={ref}>
      <SoundCard>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full max-w-75"
        >
          {bins.map((count, i) => {
            const angle = (-90 + i * 40) * (Math.PI / 180)
            const r1 = 42
            const r2 = 68 + (count / max) * 58

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
                  className={
                    isInView ? "orbit-spoke orbit-spoke-animate" : "orbit-spoke"
                  }
                  style={{ animationDelay: `${i * 70}ms` }}
                />
                <text
                  x={cx + Math.cos(angle) * (r2 + 18)}
                  y={cy + Math.sin(angle) * (r2 + 18) + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,.62)"
                  fontSize="12"
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
            fontWeight="700"
          >
            {mean(values).toFixed(1)}
          </text>
        </svg>

        <h3 className="text-center text-base font-semibold sm:text-lg">
          {title}
        </h3>
      </SoundCard>
    </div>
  )
}

export default function ProgrammeWaveform({ rows }: ProgrammeWaveformProps) {
  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ProgrammeWave rows={rows} />
        <ImpactEqualiser rows={rows} />
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
        <VoiceConstellation rows={rows} />
        <ParticipantTracks rows={rows} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <OrbitalScore
          rows={rows}
          metric="confidence"
          title="Feeling confident"
          color="var(--color-acid)"
        />

        <OrbitalScore
          rows={rows}
          metric="control"
          title="Feeling in control"
          color="var(--color-violet)"
        />

        <OrbitalScore
          rows={rows}
          metric="connection"
          title="Feeling connected"
          color="var(--color-white)"
        />
      </div>
      <p className="mt-5 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
        Each orbit shows how scores are distributed across sessions. Longer
        spokes indicate scores that appeared more often.
      </p>
    </div>
  )
}
