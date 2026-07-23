import { Link } from 'react-router-dom'
import './LegalFooter.css'

export function LegalFooter() {
  return (
    <footer className="legal-footer">
      <Link to="/legal/aviso-legal">Aviso legal</Link>
      <Link to="/legal/privacidad">Privacidad</Link>
      <Link to="/legal/terminos">Términos</Link>
    </footer>
  )
}
