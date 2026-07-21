import './PageFallback.css'

export function PageFallback() {
  return (
    <div className="page-fallback">
      <span className="page-fallback-spinner" aria-hidden="true" />
      <p>Cargando...</p>
    </div>
  )
}
