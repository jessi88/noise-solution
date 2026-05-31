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
    | "Most Negative Sentence Competence"
    | "Most Negative Sentence Autonomy"
    | "Most Negative Sentence Relatedness"
  label: string
  scoreKey: "confidence" | "control" | "connection" | "sessionRating"
}

function shuffleArray<T>(array: T[]) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

const quoteThemes: QuoteTheme[] = [
  {
    value: "Most Positive Sentence Overall",
    label: "Most positive overall",
    scoreKey: "sessionRating",
  },
  {
    value: "Most Positive Sentence Competence",
    label: "Feeling confident",
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
    label: "Overall challenges",
    scoreKey: "sessionRating",
  },
  {
    value: "Most Negative Sentence Competence",
    label: "Confidence challenges",
    scoreKey: "confidence",
  },
  {
    value: "Most Negative Sentence Autonomy",
    label: "Control challenges",
    scoreKey: "control",
  },
  {
    value: "Most Negative Sentence Relatedness",
    label: "Connection challenges",
    scoreKey: "connection",
  },
]

export default function QuoteBands({ rows }: QuoteBandsProps) {
  const quoteCount = 9

  const [theme, setTheme] = useState<QuoteTheme["value"]>(
    "Most Positive Sentence Overall"
  )

  const [quoteState, setQuoteState] = useState<{
    theme: QuoteTheme["value"]
    page: number
    shuffledQuotes: Array<{
      quote: string
      session: number | null
      score: number | null
    }>
  }>({
    theme: "Most Positive Sentence Overall",
    page: 0,
    shuffledQuotes: [],
  })

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

  const activeShuffledQuotes = useMemo(() => {
    if (quoteState.theme === theme && quoteState.shuffledQuotes.length > 0) {
      return quoteState.shuffledQuotes
    }

    return shuffleArray(quotes)
  }, [quoteState, theme, quotes])

  const page = quoteState.theme === theme ? quoteState.page : 0

  const visibleQuotes = useMemo(() => {
    const start = page * quoteCount
    return activeShuffledQuotes.slice(start, start + quoteCount)
  }, [activeShuffledQuotes, page, quoteCount])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={theme}
          onValueChange={(value) => {
            const nextTheme = value as QuoteTheme["value"]
            setTheme(nextTheme)

            const nextActiveTheme =
              quoteThemes.find((d) => d.value === nextTheme) ?? quoteThemes[0]

            const nextQuotes = rows
              .filter((d) => {
                const quote = d[nextActiveTheme.value]
                return typeof quote === "string" && quote.trim().length > 0
              })
              .map((d) => ({
                quote: String(d[nextActiveTheme.value]),
                session: d.sessionNumber,
                score:
                  typeof d[nextActiveTheme.scoreKey] === "number"
                    ? d[nextActiveTheme.scoreKey]
                    : null,
              }))

            setQuoteState({
              theme: nextTheme,
              page: 0,
              shuffledQuotes: shuffleArray(nextQuotes),
            })
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
                className="text-base font-medium data-highlighted:font-medium data-[state=checked]:font-medium"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={() => {
            const totalPages = Math.ceil(
              activeShuffledQuotes.length / quoteCount
            )
            const nextPage = page + 1

            if (nextPage < totalPages) {
              setQuoteState({
                theme,
                page: nextPage,
                shuffledQuotes: activeShuffledQuotes,
              })
            } else {
              setQuoteState({
                theme,
                page: 0,
                shuffledQuotes: shuffleArray(quotes),
              })
            }
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
                {activeTheme.scoreKey === "sessionRating"
                  ? `Session rating: ${item.score.toFixed(1)} / 10`
                  : `Related score: ${item.score.toFixed(1)} / 9`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
