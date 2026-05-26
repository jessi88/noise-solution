import * as d3 from "d3"
import type { DashboardDataRow } from "@/hooks/useDashboardData"

type EngagementCorrelationProps = {
  rows: DashboardDataRow[]
}

const mean = (values: Array<number | null | undefined>) =>
  d3.mean(values.filter((v): v is number => typeof v === "number")) ?? 0

export default function EngagementCorrelation({
  rows,
}: EngagementCorrelationProps) {
  const data = Array.from(
    d3.group(rows, (d) => String(d["Participant Gender"] || "Unknown"))
  )
    .map(([gender, values]) => ({
      gender,
      sessions: values.length,
      average: mean(
        values.map((d) =>
          d.confidence !== null && d.control !== null && d.connection !== null
            ? (d.confidence + d.control + d.connection) / 3
            : null
        )
      ),
    }))
    .sort((a, b) => b.sessions - a.sessions)

  return (
    <div className="rounded-3xl border border-acid/40 bg-white/4 p-4 text-white sm:p-6">
      <p className="text-base font-semibold sm:text-lg">
        Participant sessions by gender
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/6">
        <table className="w-full min-w-130 border-collapse text-left">
          <thead className="bg-acid/10 text-acid">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase sm:px-5 sm:py-4">
                Gender
              </th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase sm:px-5 sm:py-4">
                Sessions
              </th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase sm:px-5 sm:py-4">
                Average overall
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr key={d.gender} className="border-t border-white/10">
                <td className="px-4 py-4 text-sm font-medium sm:px-5 sm:text-base">
                  {d.gender}
                </td>
                <td className="px-4 py-4 text-sm font-medium sm:px-5 sm:text-base">
                  {d.sessions}
                </td>
                <td className="px-4 py-4 text-sm font-medium sm:px-5 sm:text-base">
                  {d.average.toFixed(1)} / 9
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm leading-relaxed font-medium text-white/60 sm:text-base">
        "Average overall" combines confidence, control, and connection into a
        single average score across recorded sessions.
      </p>
    </div>
  )
}
