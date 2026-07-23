import { Link } from 'react-router-dom'
import { legalConfig } from '../../legal/legalConfig'
import './LegalPage.css'

export function TerminosPage() {
  return (
    <main className="legal-page">
      <h1>Términos y condiciones</h1>
      <p className="legal-page-updated">Última actualización: {legalConfig.lastUpdated}</p>

      <h2>Objeto del servicio</h2>
      <p>
        Estos términos regulan el uso del servicio de reserva de mesa online ofrecido a través
        de esta Plataforma, operada por{' '}
        <span className="legal-placeholder">{legalConfig.companyName}</span>, en nombre y por
        cuenta de cada restaurante afiliado. Al enviar una reserva, aceptas estos términos.
      </p>

      <h2>Reservas</h2>
      <p>
        Al reservar mesa, tu solicitud queda pendiente de confirmación por parte del
        restaurante. La Plataforma no garantiza la disponibilidad de mesa hasta que el
        restaurante confirme la reserva. Puedes consultar, modificar o cancelar tu reserva desde
        la página de gestión de reserva, identificándote con tu teléfono y la fecha reservada.
      </p>

      <h2>Cancelaciones y no presentación</h2>
      <p>
        Si no puedes acudir, te pedimos que canceles tu reserva con la mayor antelación posible
        para que la mesa quede disponible para otros clientes. El restaurante puede tener en
        cuenta las no presentaciones repetidas ("no-shows") para futuras reservas.
      </p>

      <h2>Sin pago online</h2>
      <p>
        Esta Plataforma no procesa pagos ni cobros online en el momento de reservar. Cualquier
        pago se realiza directamente en el restaurante, según sus propias condiciones.
      </p>

      <h2>Responsabilidad del restaurante</h2>
      <p>
        Cada restaurante es responsable de la exactitud de la información publicada (horarios,
        carta, aforo, contacto) y de la correcta prestación del servicio de restauración. La
        Plataforma no interviene en la relación comercial entre el restaurante y el cliente más
        allá de facilitar la gestión de la reserva.
      </p>

      <h2>Modificación de estos términos</h2>
      <p>
        Podemos actualizar estos términos para reflejar cambios legales o del servicio. La
        fecha de "última actualización" indica la versión vigente.
      </p>

      <p>
        Para cualquier duda sobre estos términos, puedes escribir a{' '}
        <span className="legal-placeholder">{legalConfig.contactEmail}</span>. Consulta también
        el <Link to="/legal/aviso-legal">Aviso legal</Link> y la{' '}
        <Link to="/legal/privacidad">Política de privacidad</Link>.
      </p>

      <Link to="/" className="legal-page-back">
        ← Volver al inicio
      </Link>
    </main>
  )
}
