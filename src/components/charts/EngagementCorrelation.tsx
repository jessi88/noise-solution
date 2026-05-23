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
    <div className="rounded-3xl border border-acid/70 bg-white/4 p-8 text-white">
      <p className="text-xl font-black">Participants by gender and age band</p>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white/6">
        <table className="w-full border-collapse text-left">
          <thead className="bg-acid/10 text-acid">
            <tr>
              <th className="px-5 py-4 text-sm font-black tracking-wide uppercase">
                Gender
              </th>

              <th className="px-5 py-4 text-sm font-black tracking-wide uppercase">
                Sessions
              </th>

              <th className="px-5 py-4 text-sm font-black tracking-wide uppercase">
                Average overall
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr key={d.gender} className="border-t border-white/10">
                <td className="px-5 py-5 text-lg font-bold">{d.gender}</td>

                <td className="px-5 py-5 text-lg font-bold">{d.sessions}</td>

                <td className="px-5 py-5 text-lg font-bold">
                  {d.average.toFixed(1)} / 9
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
