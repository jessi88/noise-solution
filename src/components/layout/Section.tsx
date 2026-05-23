import type { ReactNode } from "react"

type SectionProps = {
  id?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-7xl scroll-mt-15 px-4 py-10 sm:px-6 sm:py-12 lg:py-16 ${className}`}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-black tracking-[0.2em] text-current/60 uppercase sm:text-sm">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="mb-4 max-w-7xl text-3xl font-medium tracking-tighter sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="mb-8 max-w-7xl text-sm leading-relaxed font-medium text-white/65 sm:text-base">
          {subtitle}
        </p>
      )}

      {children}
    </section>
  )
}
