import Header from "./components/layout/Header"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import Section from "./components/layout/Section"
import PartnerIntro from "./components/storytelling/PartnerIntro"
import StatCard from "./components/storytelling/StatCard"
import MetricCard from "./components/storytelling/MetricCard" //maybe rename to QuotePanel
import ProgrammeWaveform from "./components/charts/ProgrammeWaveform"
import JourneyLineChart from "./components/charts/JourneyLineChart"
import QuoteBands from "./components/charts/QuoteBands"
import ParticipantJourneyMap from "./components/charts/ParticipantJourneyMap"
import SectorPatterns from "./components/charts/SectorPatterns"
import EngagementCorrelation from "./components/charts/EngagementCorrelation"
import NoteBlock from "./components/storytelling/NoteBlock"
import MethodAccordion from "./components/storytelling/MethodAccordion"
import { useDashboardData } from "./hooks/useDashboardData"
import * as d3 from "d3"

export function App() {
  const { rows, participants, sessions, avgRating } = useDashboardData()

  return (
    <>
      <Header />
      <PartnerIntro />
      <NavBar />
      <Section
        id="headline"
        eyebrow=""
        title="What changed?"
        subtitle="A snapshot of participation, session journeys, and reported change over time."
        className="text-white"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <StatCard label="young people represented" value={participants} />

          <StatCard label="session journeys captured" value={sessions} />

          <StatCard
            label="average session rating"
            value={`${avgRating.toFixed(1)}/10`}
          />

          <StatCard
            label="AI readings averaged into stable session evidence"
            value={rows
              .reduce((sum, d) => sum + Number(d["AI runs"] ?? 0), 0)
              .toLocaleString()}
          />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <MetricCard
            pill="Feeling confident"
            headline="I can do this."
            value={`${
              d3.mean(rows, (d) => d.confidence ?? undefined)?.toFixed(1) ??
              "n/a"
            }/9`}
            label="average directional indicator score"
            quote={
              rows.find((d) => d["Most Positive Sentence Competence"])?.[
                "Most Positive Sentence Competence"
              ] ?? ""
            }
          />

          <MetricCard
            pill="Feeling in control"
            headline="My choices matter."
            value={`${d3.mean(rows, (d) => d.control ?? undefined)?.toFixed(1) ?? "n/a"}/9`}
            label="average directional indicator score"
            quote={
              rows.find((d) => d["Most Positive Sentence Autonomy"])?.[
                "Most Positive Sentence Autonomy"
              ] ?? ""
            }
          />

          <MetricCard
            pill="Feeling connected"
            headline="I matter to people."
            value={`${
              d3.mean(rows, (d) => d.connection ?? undefined)?.toFixed(1) ??
              "n/a"
            }/9`}
            label="average directional indicator score"
            quote={
              rows.find((d) => d["Most Positive Sentence Relatedness"])?.[
                "Most Positive Sentence Relatedness"
              ] ?? ""
            }
          />
        </div>
        <NoteBlock title="How to read these scores">
          <p>
            <strong className="text-white">
              The numbers are directional indicators, not precise clinical
              measures.
            </strong>{" "}
            The project team has flagged that scoring guidance may have changed
            over time, and the data show possible scale compression after late
            2025.
          </p>

          <p>
            For that reason, this dashboard pairs every score with participant
            voice and focuses on broad patterns: consistency, movement, turning
            points, and repeated themes.
          </p>
        </NoteBlock>
      </Section>

      <Section
        id="journey"
        eyebrow=""
        title="How change develops over time"
        subtitle="The story is not a single static average. It is a set of journeys: growth, steadiness, setbacks, and turning points across sessions."
        className="text-white"
      >
        <div className="space-y-6">
          <JourneyLineChart rows={rows} />

          <ParticipantJourneyMap rows={rows} />
        </div>

        <NoteBlock title="Reading journey lines responsibly">
          <p>
            The journey visuals are best read as{" "}
            <strong className="text-white">movement over time</strong>, not
            exact before-and-after proof. Later sessions involve fewer
            participants, and AI-generated scores can shift if prompts, models,
            or scoring instructions change.
          </p>

          <p>
            The safest interpretation is: where numeric movement and participant
            quotes point in the same direction, confidence in the impact story
            is stronger.
          </p>
        </NoteBlock>
      </Section>

      <Section
        id="voices"
        eyebrow=""
        title="What young people actually said"
        subtitle="Every number becomes more meaningful when paired with the participant's own words. These excerpts highlight both positive experiences and challenges across confidence, control, connection, and overall programme experience."
        className="text-white"
      >
        <QuoteBands rows={rows} />
      </Section>

      <Section
        id="sonic"
        eyebrow=""
        title="The sound of impact"
        subtitle="These visuals draw on Noise Solution's waveform-inspired style, showing emotional change through movement, rhythm, and participant voice."
        className="text-white"
      >
        <ProgrammeWaveform rows={rows} />
      </Section>

      <Section
        id="patterns"
        eyebrow=""
        title="What patterns are emerging?"
        subtitle="These comparisons support operational learning and should be interpreted carefully rather than used to rank young people."
        className="text-white"
      >
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <SectorPatterns rows={rows} />
          <EngagementCorrelation rows={rows} />
        </div>
      </Section>

      <Section
        id="method"
        eyebrow=""
        title="How we measure impact"
        subtitle=""
        className="text-white"
      >
        <MethodAccordion />
      </Section>

      <Footer />
    </>
  )
}

export default App
