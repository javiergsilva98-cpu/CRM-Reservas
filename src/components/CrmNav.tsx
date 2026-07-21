import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './CrmNav.css'

export function CrmNav({ slug }: { slug: string }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <nav className="crm-nav">
      <div className="crm-nav-links">
        <Link to={`/${slug}/crm`}>Reservas</Link>
        <Link to={`/${slug}/crm/nueva-reserva`}>+ Nueva reserva</Link>
        <Link to={`/${slug}/crm/clientes`}>Clientes</Link>
        <Link to={`/${slug}/crm/sala`}>Sala</Link>
        <Link to={`/${slug}/crm/disponibilidad`}>Disponibilidad</Link>
        <Link to={`/${slug}/crm/mesas`}>Mesas</Link>
        <Link to={`/${slug}/crm/horarios`}>Horarios</Link>
        <Link to={`/${slug}/crm/analitica`}>Analítica</Link>
      </div>
      <button onClick={handleSignOut}>Cerrar sesión</button>
    </nav>
  )
}
