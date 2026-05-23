const navItems = [
  { href: "#headline", label: "What changed?" },
  { href: "#journey", label: "The journey" },
  { href: "#voices", label: "Young people’s voices" },
  { href: "#sonic", label: "Sonic visuals" },
  { href: "#patterns", label: "Patterns" },
  { href: "#method", label: "How we measure" },
]

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-y border-white/10 bg-black/90 backdrop-blur-md">
      <div className="nav-scroll mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/15 bg-white/4.5 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:border-acid hover:bg-acid hover:text-black sm:px-4 sm:py-2.5 sm:text-sm"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
