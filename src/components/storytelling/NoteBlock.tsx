import type { ReactNode } from "react"

type NoteBlockProps = {
  title: string
  children: ReactNode
}

export default function NoteBlock({ title, children }: NoteBlockProps) {
  return (
    <div className="mt-7 rounded-3xl border border-acid/70 p-5 text-white md:p-8">
      <h3 className="text-xl font-medium text-acid sm:text-2xl">{title}</h3>

      <div className="mt-4 space-y-3 text-sm leading-relaxed font-medium text-white/75 sm:text-base">
        {children}
      </div>
    </div>
  )
}
