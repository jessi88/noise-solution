import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function MethodAccordion() {
  return (
    //<div className="mt-7 rounded-3xl border border-acid/70 p-5 text-white md:p-8">
    <div className="rounded-3xl border border-acid/70 p-5 text-white md:p-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="items-start text-left text-base leading-snug font-semibold text-acid hover:no-underline sm:text-lg">
            Why the dashboard uses directional language
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            <p>
              The project team identified a possible change in how confidence,
              control and connection were scored. For that reason, the dashboard
              avoids over-precise claims and treats the values as directional
              indicators supported by participant voice.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="items-start text-left text-base leading-snug font-semibold text-acid hover:no-underline sm:text-lg">
            What the scores are best used for
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            <p>
              The scores are useful for spotting recurring themes, broad
              trajectories, consistency, turning points and questions for
              learning. They should not be treated as clinical measures, formal
              diagnoses or exact psychometric benchmarks.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="items-start text-left text-base leading-snug font-semibold text-acid hover:no-underline sm:text-lg">
            Why participant voice remains central
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            <p>
              Quotes make the numbers believable and the numbers help avoid
              relying on isolated anecdotes. The strongest evidence comes when
              score patterns and repeated participant reflections point in the
              same direction.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="items-start text-left text-base leading-snug font-semibold text-acid hover:no-underline sm:text-lg">
            Method detail for technical audiences
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-white/75">
            <p>
              Reflection videos are analysed against three evidence-based needs:
              competence, autonomy, and relatedness. In the dashboard these are
              translated as feeling confident, feeling in control, and feeling
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
              issue. But the exported data do not show a clean expansion in the
              score range. Later exports appear to contain fewer high-end
              scores, which may indicate compression, calibration drift, prompt
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
