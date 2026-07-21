import { useEffect, useRef } from 'react'
import type { RecommendedDish } from '../data/recomendados'
import './RecommendedCarousel.css'

interface RecommendedCarouselProps {
  platos: RecommendedDish[]
  titulo?: string
}

// Recorrido máximo (px) del parallax dentro de cada tarjeta.
const PARALLAX_STRENGTH = 40

export function RecommendedCarousel({ platos, titulo = 'Recomendados' }: RecommendedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const imgWrapRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let ticking = false

    function update() {
      if (!track) return
      const trackRect = track.getBoundingClientRect()
      const viewportCenter = trackRect.left + trackRect.width / 2
      const viewportWidth = trackRect.width || window.innerWidth

      let activeIndex = 0
      let smallestOffset = Infinity

      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const offset = (cardCenter - viewportCenter) / viewportWidth

        const imgWrap = imgWrapRefs.current[i]
        if (imgWrap && !reduceMotion) {
          imgWrap.style.transform = `translateX(${offset * -PARALLAX_STRENGTH}px)`
        }

        const absOffset = Math.abs(offset)
        if (absOffset < smallestOffset) {
          smallestOffset = absOffset
          activeIndex = i
        }
      })

      cardRefs.current.forEach((card, i) => {
        card?.classList.toggle('rc-card--active', i === activeIndex)
      })

      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [platos.length])

  return (
    <section className="rc-section">
      <p className="rc-eyebrow">{titulo}</p>
      <div className="rc-track" ref={trackRef}>
        {platos.map((plato, i) => (
          <div
            className="rc-card"
            key={plato.nombre}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
          >
            <div
              className="rc-card-imgwrap"
              ref={(el) => {
                imgWrapRefs.current[i] = el
              }}
            >
              <img
                className="rc-card-img"
                src={plato.imagen}
                alt={plato.nombre}
                loading="lazy"
                style={{
                  objectPosition: plato.focalPoint
                    ? `${plato.focalPoint.x}% ${plato.focalPoint.y}%`
                    : 'center',
                }}
              />
            </div>
            <div className="rc-card-overlay" />
            <div className="rc-card-content">
              {plato.tag && <span className="rc-card-tag">{plato.tag}</span>}
              <h3 className="rc-card-name">{plato.nombre}</h3>
              {plato.descripcion && <p className="rc-card-description">{plato.descripcion}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
