import { useMemo, useState } from "react"
import type { DashboardDataRow } from "@/hooks/useDashboardData"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type QuoteBandsProps = {
  rows: DashboardDataRow[]
}

type QuoteTheme = {
  value:
    | "Most Positive Sentence Overall"
    | "Most Positive Sentence Competence"
    | "Most Positive Sentence Autonomy"
    | "Most Positive Sentence Relatedness"
    | "Most Negative Sentence Overall"
  label: string
  scoreKey: "confidence" | "control" | "connection" | "sessionRating"
}

const quoteThemes: QuoteTheme[] = [
  {
    value: "Most Positive Sentence Overall",
    label: "Most positive overall",
    scoreKey: "sessionRating",
  },
  {
    value: "Most Positive Sentence Competence",
    label: "Confidence",
    scoreKey: "confidence",
  },
  {
    value: "Most Positive Sentence Autonomy",
    label: "Feeling in control",
    scoreKey: "control",
  },
  {
    value: "Most Positive Sentence Relatedness",
    label: "Feeling connected",
    scoreKey: "connection",
  },
  {
    value: "Most Negative Sentence Overall",
    label: "Setbacks / challenges",
    scoreKey: "sessionRating",
  },
]

export default function QuoteBands({ rows }: QuoteBandsProps) {
  const quoteCount = 9

  const [theme, setTheme] = useState<QuoteTheme["value"]>(
    "Most Positive Sentence Overall"
  )

  const [offset, setOffset] = useState(0)

  const activeTheme =
    quoteThemes.find((d) => d.value === theme) ?? quoteThemes[0]

  const quotes = useMemo(() => {
    return rows
      .filter((d) => {
        const quote = d[activeTheme.value]
        return typeof quote === "string" && quote.trim().length > 0
      })
      .map((d) => ({
        quote: String(d[activeTheme.value]),
        session: d.sessionNumber,
        score:
          typeof d[activeTheme.scoreKey] === "number"
            ? d[activeTheme.scoreKey]
            : null,
      }))
  }, [rows, activeTheme])

  const visibleQuotes = useMemo(() => {
    if (quotes.length <= quoteCount) return quotes

    return Array.from({ length: quoteCount }, (_, i) => {
      return quotes[(offset + i) % quotes.length]
    })
  }, [quotes, offset, quoteCount])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={theme}
          onValueChange={(value) => {
            setTheme(value as QuoteTheme["value"])
            setOffset(0)
          }}
        >
          <SelectTrigger className="h-10! w-full rounded-full border border-white/30 bg-white/4 px-4 text-sm leading-none font-medium text-white sm:w-72">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="rounded-2xl border border-white/20 bg-black text-white">
            {quoteThemes.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="text-base font-black"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={() => {
            if (quotes.length <= quoteCount) return
            setOffset(Math.floor(Math.random() * quotes.length))
          }}
          className="h-11! w-full rounded-full bg-acid px-4 py-0 text-sm leading-none font-medium text-black hover:bg-acid/90 sm:w-auto"
        >
          Show different voices
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {visibleQuotes.map((item, index) => (
          <div
            key={`${item.quote}-${index}`}
            className="rounded-3xl border border-acid/40 bg-white/4 p-5 text-white transition duration-300 hover:-translate-y-1 hover:border-acid sm:p-6"
          >
            <span className="rounded-full border border-acid/40 bg-acid/10 px-3 py-1.5 text-xs font-semibold text-acid sm:text-sm">
              Session {item.session ?? "n/a"}
            </span>

            <blockquote className="mt-6 border-l-4 border-acid pl-4 text-base leading-relaxed font-medium text-white/90 italic sm:mt-8 sm:pl-5 sm:text-lg">
              “{item.quote}”
            </blockquote>

            {item.score !== null && (
              <p className="mt-5 text-sm font-medium text-white/55 sm:text-base">
                Related score: {item.score.toFixed(1)} / 9
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
