import { useEffect, useRef, useState } from 'react'
import './ScrollVideoHero.css'

interface ScrollVideoHeroProps {
  title: string
  tagline?: string
  videoSrc: string
  posterSrc: string
}

const LERP_FACTOR = 0.22
const MIN_SEEK_DELTA = 1 / 90

// Fracción del scroll en la que la puerta empieza/termina de abrirse en el
// vídeo (medido sobre el clip: ~4.0s-5.0s de los ~8.38s totales). El texto
// aparece justo en esa ventana.
const TEXT_REVEAL_START = 0.48
const TEXT_REVEAL_END = 0.6

export function ScrollVideoHero({ title, tagline, videoSrc, posterSrc }: ScrollVideoHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const smoothedTimeRef = useRef(0)
  const primedRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  const textReveal = Math.min(
    1,
    Math.max(0, (progress - TEXT_REVEAL_START) / (TEXT_REVEAL_END - TEXT_REVEAL_START)),
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // iOS bloquea la escritura de currentTime hasta que el vídeo recibe un
    // play() ligado a un gesto real; "cebamos" el vídeo en el primer toque.
    function prime() {
      if (primedRef.current || !video) return
      primedRef.current = true
      const playPromise = video.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => video.pause()).catch(() => {
          primedRef.current = false
        })
      }
    }
    window.addEventListener('touchstart', prime, { once: true, passive: true })
    window.addEventListener('pointerdown', prime, { once: true, passive: true })

    let scrollTicking = false
    function computeProgress() {
      const el = wrapperRef.current
      if (!el || !video) return

      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable > 0 ? -rect.top / scrollable : 0
      const clamped = Math.min(1, Math.max(0, p))
      setProgress(clamped)

      if (video.duration) targetTimeRef.current = clamped * video.duration
      scrollTicking = false
    }
    function onScroll() {
      if (!scrollTicking) {
        scrollTicking = true
        requestAnimationFrame(computeProgress)
      }
    }

    computeProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // Bucle independiente que suaviza (lerp) hacia el tiempo objetivo y
    // solo escribe currentTime cuando el seek anterior ya ha terminado —
    // escribir en cada evento de scroll directamente desincroniza Safari.
    let rafId = requestAnimationFrame(function tick() {
      smoothedTimeRef.current += (targetTimeRef.current - smoothedTimeRef.current) * LERP_FACTOR
      if (!video.seeking && Math.abs(video.currentTime - smoothedTimeRef.current) > MIN_SEEK_DELTA) {
        video.currentTime = smoothedTimeRef.current
      }
      rafId = requestAnimationFrame(tick)
    })

    return () => {
      window.removeEventListener('touchstart', prime)
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="video-hero-wrapper" ref={wrapperRef}>
      <div className="video-hero-sticky">
        <div className="video-hero-stage">
          {/* Capa CSS persistente: iOS Safari borra el atributo poster del
              <video> en el primer seek, así que esta capa de fondo es la
              que evita el fotograma negro mientras decodifica. */}
          <div className="video-hero-poster" style={{ backgroundImage: `url(${posterSrc})` }} />
          <video
            ref={videoRef}
            className="video-hero-video"
            src={videoSrc}
            poster={posterSrc}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onLoadedMetadata={() => setReady(true)}
          />
        </div>
        <div className="video-hero-overlay" />

        <div
          className="video-hero-content"
          style={{
            opacity: textReveal,
            filter: `blur(${(1 - textReveal) * 10}px)`,
          }}
        >
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
