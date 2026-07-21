import { useEffect, useRef, useState } from 'react'
import './ScrollVideoHero.css'

interface ScrollVideoHeroProps {
  title: string
  tagline?: string
  videoSrc: string
  posterSrc?: string
}

export function ScrollVideoHero({ title, tagline, videoSrc, posterSrc }: ScrollVideoHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let ticking = false

    function computeProgress() {
      const el = wrapperRef.current
      const video = videoRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? -rect.top / scrollable : 0
      const clamped = Math.min(1, Math.max(0, p))
      setProgress(clamped)

      if (video && video.readyState >= 1 && video.duration) {
        video.currentTime = clamped * video.duration
      }
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
    <div className="video-hero-wrapper" ref={wrapperRef}>
      <div className="video-hero-sticky">
        <video
          ref={videoRef}
          className="video-hero-video"
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => setReady(true)}
        />
        <div className="video-hero-overlay" />

        <div className="video-hero-content">
          <p className="video-hero-eyebrow">Bienvenido a</p>
          <h1>{title}</h1>
          {tagline && <p className="video-hero-tagline">{tagline}</p>}
        </div>

        {ready && progress < 0.1 && (
          <p className="video-hero-hint">Desplázate para descubrir el restaurante ↓</p>
        )}
      </div>
    </div>
  )
}
