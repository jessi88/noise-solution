import { Card, CardContent } from "@/components/ui/card"

type StatCardProps = {
  value: string | number
  label: string
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className="rounded-3xl border border-acid/40 bg-white/4 text-white transition duration-300 hover:-translate-y-1 hover:border-acid">
      <CardContent className="px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-3xl font-semibold tracking-tight text-acid sm:text-[2rem]">
          {value}
        </p>

        <p className="mt-2 text-sm leading-snug font-medium text-white/75 sm:text-base">
          {label}
        </p>
      </CardContent>
    </Card>
  )
}
