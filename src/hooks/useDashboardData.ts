import {
  dashboardData,
  type RawDashboardRow,
} from "../data/noise_solution_session_level_data"

// Safely convert unknown values into numbers
const number = (value: unknown): number | null => {
  const n = Number(value)

  return Number.isFinite(n) ? n : null
}

export type DashboardDataRow = RawDashboardRow & {
  confidence: number | null
  control: number | null
  connection: number | null
  sessionRating: number | null
  confidence_std: number | null
  control_std: number | null
  connection_std: number | null
  sessionRating_std: number | null
  sessionNumber: number | null
  date: Date | null
}

export function useDashboardData() {
  const rows: DashboardDataRow[] = dashboardData.map((d: RawDashboardRow) => ({
    ...d,
    confidence: number(d["Competence Avg"]),
    control: number(d["Autonomy Avg"]),
    connection: number(d["Relatedness Avg"]),
    sessionRating: number(d["Session Rating Avg"]),
    confidence_std: number(d["Competence Std"]),
    control_std: number(d["Autonomy Std"]),
    connection_std: number(d["Relatedness Std"]),
    sessionRating_std: number(d["Session Rating Std"]),
    sessionNumber: number(d["Participant Session #"]),
    // Parse session date into a TS Date object
    date: d["Session Start Parsed"]
      ? new Date(d["Session Start Parsed"])
      : null,
  }))

  // Count unique participants
  const participants = new Set(
    rows.map((d) => d.UIN).filter((d) => d !== null && d !== undefined)
  ).size

  // Total number of sessions
  const sessions = rows.length
  // Filter rows with valid session ratings (removing NaNs)
  const avgRatingRows = rows.filter((d) => d.sessionRating !== null)

  // Compute overall average session rating among valid session ratings
  const avgRating =
    avgRatingRows.reduce((a, d) => a + (d.sessionRating ?? 0), 0) /
    Math.max(avgRatingRows.length, 1)

  return { rows, participants, sessions, avgRating }
}
