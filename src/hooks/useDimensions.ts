import { useLayoutEffect, useState } from "react"

export function useDimensions<T extends HTMLElement>(
  targetRef: React.RefObject<T | null>
) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  useLayoutEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return

      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [targetRef])

  return dimensions
}