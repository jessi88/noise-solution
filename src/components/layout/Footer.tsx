export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-base font-semibold sm:text-lg">Noise Solution</p>

          <p className="mt-3 max-w-xl text-sm leading-relaxed font-medium text-white/60 sm:text-base">
            AI-derived scores are presented as directional, narrative-supported
            indicators rather than precise psychometric measures.
          </p>
        </div>

        <div className="text-sm font-medium text-white/45">
          <p>Built with Data ChangeMakers</p>
          <p className="mt-1">Narrative impact dashboard prototype</p>
        </div>
      </div>
    </footer>
  )
}
