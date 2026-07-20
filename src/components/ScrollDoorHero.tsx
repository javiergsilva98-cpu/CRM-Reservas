import { useEffect, useRef, useState } from 'react'
import './ScrollDoorHero.css'

interface ScrollDoorHeroProps {
  title: string
  tagline?: string
}

export function ScrollDoorHero({ title, tagline }: ScrollDoorHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    function computeProgress() {
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? -rect.top / scrollable : 0
      setProgress(Math.min(1, Math.max(0, p)))
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(computeProgress)
      }
    }

    computeProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="door-hero-wrapper" ref={wrapperRef}>
      <div className="door-hero-sticky">
        <div className="door-hero-content">
          <p className="door-hero-eyebrow">Bienvenido a</p>
          <h1>{title}</h1>
          {tagline && <p className="door-hero-tagline">{tagline}</p>}
        </div>

        <div
          className="door door-left"
          style={{ transform: `translateX(${-progress * 100}%)` }}
        />
        <div
          className="door door-right"
          style={{ transform: `translateX(${progress * 100}%)` }}
        />

        {progress < 0.1 && (
          <p className="door-hero-hint">Desplázate para abrir las puertas ↓</p>
        )}
      </div>
    </div>
  )
}
