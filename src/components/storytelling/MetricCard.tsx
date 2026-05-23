import { Card, CardContent } from "@/components/ui/card"

type MetricCardProps = {
  pill: string
  headline: string
  value: string | number
  label: string
  quote: string
}

export default function MetricCard({
  pill,
  headline,
  value,
  label,
  quote,
}: MetricCardProps) {
  return (
    <Card className="rounded-3xl border border-acid/40 bg-white/4 p-0 text-white transition duration-300 hover:-translate-y-1 hover:border-acid">
      <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
        <span className="inline-flex rounded-full border border-acid/20 bg-acid/10 px-3 py-1.5 text-xs font-semibold text-acid">
          {pill}
        </span>

        <div className="mt-5 pl-3">
          <h3 className="text-xl leading-tight font-medium sm:text-2xl">
            {headline}
          </h3>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-acid sm:text-4xl">
            {value}
          </p>

          <p className="mt-1 text-sm font-medium text-white/70 sm:text-base">
            {label}
          </p>

          <blockquote className="mt-5 border-l-4 border-acid pl-4 text-base leading-relaxed font-medium text-white/85 italic sm:text-lg">
            “{quote}”
          </blockquote>
        </div>
      </CardContent>
    </Card>
  )
}
