import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function MethodAccordion() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/4 p-5 text-white sm:p-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left text-base font-semibold text-acid hover:no-underline">
            Why the dashboard uses directional language
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            The project owner identified a possible change in how confidence,
            control and connection were scored. The exported data does not show
            a clear expansion from a 1–5 to a 1–9 range; later records appear
            compressed, with few or no high-end scores after late 2025. For that
            reason, the dashboard avoids over-precise claims and treats the
            values as directional indicators supported by participant voice.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left text-base font-semibold text-acid hover:no-underline">
            What the scores are best used for
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            The scores are useful for spotting recurring themes, broad
            trajectories, consistency, turning points and questions for
            learning. They should not be treated as clinical measures, formal
            diagnoses or exact psychometric benchmarks.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left text-base font-semibold text-acid hover:no-underline">
            Why participant voice remains central
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            Quotes make the numbers believable and the numbers help avoid
            relying on isolated anecdotes. The strongest evidence comes when
            score patterns and repeated participant reflections point in the
            same direction.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-left text-base font-semibold text-acid hover:no-underline">
            Method detail for technical audiences
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            <p>
              Reflection videos are analysed against three evidence-based needs:
              competence, autonomy, and relatedness. In the dashboard these are
              translated as confidence, feeling in control, and feeling
              connected.
            </p>
            <p>
              Because AI outputs vary, each analysis is run multiple times. This
              dashboard uses one session-level row per participant/session by
              averaging numeric scores and using the most common qualitative
              sentence for repeated runs.
            </p>
            <p>
              The project team has also identified a possible scoring-scale
              issue: guidance may have changed from a 1–5 to a 1–9 scale, but
              the exported data do not show a clean expansion in the score
              range. After late 2025, the data appear to contain fewer high-end
              scores, suggesting possible compression, calibration drift, prompt
              effects, or export/post-processing changes.
            </p>
            <p>
              For that reason, the dashboard avoids treating the scores as exact
              psychometric measurements. It uses rounded values, plain-English
              labels, directional wording, and qualitative triangulation. The
              most trustworthy claims are those where scores, repeated
              reflections, and participant quotes tell the same story.
            </p>
            <p>
              Recommended ongoing checks: review prompt/model/version history;
              plot monthly distributions, maximums, and variance for each score;
              and avoid comparing pre/post scale-change periods without clear
              calibration evidence.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
