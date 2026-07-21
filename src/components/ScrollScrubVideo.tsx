import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './ScrollScrubVideo.css'

interface ScrollScrubVideoProps {
  videoSrc: string
  posterSrc: string
  /** Fracción de scroll (0-1) en la que el contenido empieza/termina de revelarse. */
  revealStart: number
  revealEnd: number
  /**
   * Fracción de la pantalla que ya debe estar a la vista (0-1) para que el
   * vídeo empiece a moverse, en vez de esperar a que la sección cubra el
   * 100% del viewport. El final del scrub no cambia.
   */
  startFraction?: number
  hint?: string
  children: ReactNode
}

const LERP_FACTOR = 0.22
const MIN_SEEK_DELTA = 1 / 90

export function ScrollScrubVideo({
  videoSrc,
  posterSrc,
  revealStart,
  revealEnd,
  startFraction = 0,
  hint,
  children,
}: ScrollScrubVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const smoothedTimeRef = useRef(0)
  const primedRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  const reveal = Math.min(1, Math.max(0, (progress - revealStart) / (revealEnd - revealStart)))

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
      // El scrub empieza en cuanto la sección lleva `startFraction` de
      // pantalla a la vista, no cuando cubre el 100% del viewport, pero
      // sigue terminando en el mismo punto de siempre (fin del pin).
      const startOffset = startFraction * window.innerHeight
      const scrollable = rect.height - window.innerHeight + startOffset
      const p = scrollable > 0 ? (startOffset - rect.top) / scrollable : 0
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
  }, [startFraction])

  return (
    <div className="scroll-scrub-wrapper" ref={wrapperRef}>
      <div className="scroll-scrub-sticky">
        <div className="scroll-scrub-stage">
          {/* Capa CSS persistente: iOS Safari borra el atributo poster del
              <video> en el primer seek, así que esta capa de fondo es la
              que evita el fotograma negro mientras decodifica. */}
          <div className="scroll-scrub-poster" style={{ backgroundImage: `url(${posterSrc})` }} />
          <video
            ref={videoRef}
            className="scroll-scrub-video"
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
        <div className="scroll-scrub-overlay" />

        <div
          className="scroll-scrub-content"
          style={{ opacity: reveal, filter: `blur(${(1 - reveal) * 10}px)` }}
        >
          {children}
        </div>

        {hint && ready && progress < 0.1 && <p className="scroll-scrub-hint">{hint}</p>}
      </div>
    </div>
  )
}
