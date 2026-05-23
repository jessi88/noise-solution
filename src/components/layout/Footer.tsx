export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-black">Noise Solution</p>

          <p className="mt-3 max-w-xl text-sm leading-relaxed font-bold text-white/75 md:text-base">
            AI-derived scores are presented as directional,
            narrative-supported indicators rather than precise
            psychometric measures.
          </p>
        </div>

        <div className="text-sm font-bold text-white/50">
          <p>Built with Data Change Makers</p>
          <p className="mt-1">Narrative impact dashboard prototype</p>
        </div>
      </div>
    </footer>
  )
}