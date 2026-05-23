import { useEffect, useRef, useState } from "react"

export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.25,
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return { ref, isInView }
}
