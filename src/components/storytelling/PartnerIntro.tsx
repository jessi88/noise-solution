type PartnerIntroProps = {
  noiseLogo?: string
  dcmLogo?: string
}

const base = import.meta.env.BASE_URL

export default function PartnerIntro({
  noiseLogo = `${base}Noise Solution Logo_CORE - White and Acid Green Duotone.svg`,
  dcmLogo = `${base}DCM logo for dark bg.png`,
}: PartnerIntroProps) {
  return (
    <section className="text-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pb-16">
        <div className="flex flex-col gap-10 border-y border-white/10 py-8 md:grid md:grid-cols-2 md:items-start md:gap-16">
          <div className="flex flex-col">
            <div className="flex h-30 items-center">
              <img
                src={noiseLogo}
                alt="Noise Solution"
                className="h-28 w-auto object-contain"
              />
            </div>

            <p className="mt-8 max-w-xl text-base leading-relaxed font-medium text-white/65 sm:text-lg">
              Noise Solution supports young people through long-term music
              mentoring and creative relationships.
            </p>

            <a
              href="https://www.noisesolution.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-bold text-acid transition-opacity hover:opacity-80"
            >
              Visit Noise Solution →
            </a>
          </div>

          <div className="flex flex-col">
            <div className="flex h-30 flex-col justify-center">
              <p className="mt-5 mb-4 text-xs font-bold tracking-[0.22em] text-white/45 uppercase">
                In collaboration with
              </p>

              <div className="inline-flex self-start">
                <img
                  src={dcmLogo}
                  alt="Data ChangeMakers"
                  className="-mt-4 -ml-4 h-34 w-auto object-contain"
                />
              </div>
            </div>

            <p className="mt-8 max-w-xl text-base leading-relaxed font-medium text-white/60 sm:text-lg">
              Developed with Data ChangeMakers to explore mixed-method evidence,
              participant voice, and creative data visualisation.
            </p>

            <a
              href="https://www.datachangemakers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-bold text-acid transition-opacity hover:opacity-80"
            >
              Visit Data ChangeMakers →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
