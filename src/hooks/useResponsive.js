export function useResponsive() {
  return { isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false }
}
