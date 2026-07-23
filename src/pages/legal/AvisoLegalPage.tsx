import { Link } from 'react-router-dom'
import { legalConfig } from '../../legal/legalConfig'
import './LegalPage.css'

export function AvisoLegalPage() {
  return (
    <main className="legal-page">
      <h1>Aviso legal</h1>
      <p className="legal-page-updated">Última actualización: {legalConfig.lastUpdated}</p>

      <p>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
        titular del sitio web{' '}
        <span className="legal-placeholder">{legalConfig.companyName}</span>, con NIF/CIF{' '}
        <span className="legal-placeholder">{legalConfig.taxId}</span>, domicilio en{' '}
        <span className="legal-placeholder">{legalConfig.address}</span> y correo de contacto{' '}
        <span className="legal-placeholder">{legalConfig.contactEmail}</span>.
      </p>

      <h2>Objeto</h2>
      <p>
        Este sitio web ofrece una plataforma de gestión de reservas online para restaurantes
        (en adelante, "la Plataforma"), que permite a los clientes de cada restaurante afiliado
        reservar mesa y gestionar su reserva, y a cada restaurante administrar sus reservas,
        mesas y clientes desde un panel privado.
      </p>

      <h2>Condiciones de uso</h2>
      <p>
        El acceso y uso de este sitio web atribuye la condición de usuario y supone la
        aceptación de este aviso legal, de los{' '}
        <Link to="/legal/terminos">Términos y condiciones</Link> y de la{' '}
        <Link to="/legal/privacidad">Política de privacidad</Link>. El usuario se compromete a
        hacer un uso adecuado de los contenidos y servicios ofrecidos y a no emplearlos para
        actividades ilícitas, fraudulentas o que puedan dañar los derechos de terceros.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los contenidos propios de la Plataforma (diseño, código, textos e imágenes de la marca)
        son titularidad de{' '}
        <span className="legal-placeholder">{legalConfig.companyName}</span> o se usan con la
        correspondiente autorización. Las imágenes, nombres y contenidos propios de cada
        restaurante afiliado son titularidad de dicho restaurante.
      </p>

      <h2>Limitación de responsabilidad</h2>
      <p>
        La Plataforma actúa como intermediario tecnológico entre el restaurante y sus clientes.
        La confirmación, disponibilidad y prestación final del servicio de restauración es
        responsabilidad exclusiva de cada restaurante. No nos hacemos responsables de errores
        u omisiones en la información publicada por cada restaurante (horarios, carta, aforo).
      </p>

      <h2>Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia
        derivada del uso de este sitio, las partes se someten a los juzgados y tribunales que
        correspondan conforme a derecho.
      </p>

      <Link to="/" className="legal-page-back">
        ← Volver al inicio
      </Link>
    </main>
  )
}
