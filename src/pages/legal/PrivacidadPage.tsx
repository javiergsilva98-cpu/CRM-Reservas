import { Link } from 'react-router-dom'
import { legalConfig } from '../../legal/legalConfig'
import './LegalPage.css'

export function PrivacidadPage() {
  return (
    <main className="legal-page">
      <h1>Política de privacidad</h1>
      <p className="legal-page-updated">Última actualización: {legalConfig.lastUpdated}</p>

      <p>
        Esta política explica cómo se tratan tus datos personales cuando reservas mesa a
        través de esta Plataforma, en cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley
        Orgánica 3/2018 de Protección de Datos y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>¿Quién es el responsable de tus datos?</h2>
      <p>
        El <strong>restaurante en el que reservas</strong> es el responsable del tratamiento de
        los datos que nos facilitas para gestionar tu reserva (nombre, teléfono, email y, en su
        caso, notas o alergias). <span className="legal-placeholder">{legalConfig.companyName}</span>,
        con NIF/CIF <span className="legal-placeholder">{legalConfig.taxId}</span> y contacto{' '}
        <span className="legal-placeholder">{legalConfig.contactEmail}</span>, opera la
        Plataforma como encargado del tratamiento por cuenta de cada restaurante, proporcionando
        la infraestructura técnica para almacenar y gestionar esos datos.
      </p>

      <h2>¿Qué datos tratamos y para qué?</h2>
      <ul>
        <li>
          <strong>Datos de la reserva</strong> (nombre, teléfono, email, número de personas,
          fecha, hora y notas): para gestionar tu reserva, contactarte si es necesario
          confirmarla o modificarla, y para que el restaurante pueda atenderte correctamente.
        </li>
        <li>
          <strong>Comunicaciones comerciales</strong> (solo si marcas la casilla
          correspondiente): para enviarte ofertas o novedades del restaurante. Puedes retirar
          este consentimiento en cualquier momento escribiendo al restaurante o a{' '}
          <span className="legal-placeholder">{legalConfig.contactEmail}</span>.
        </li>
      </ul>

      <h2>Base legal</h2>
      <p>
        El tratamiento de los datos de tu reserva se basa en la ejecución de una relación
        precontractual/contractual (gestionar tu reserva de mesa). El envío de comunicaciones
        comerciales se basa en tu consentimiento explícito, que puedes otorgar o denegar sin que
        afecte a tu reserva.
      </p>

      <h2>¿Con quién compartimos tus datos?</h2>
      <p>
        Tus datos se almacenan usando proveedores de infraestructura cloud (Supabase Inc. como
        base de datos, y Vercel Inc. como alojamiento web), que actúan como encargados del
        tratamiento bajo las garantías correspondientes (incluidas cláusulas contractuales
        tipo cuando aplica transferencia internacional). No cedemos tus datos a terceros con
        fines comerciales propios.
      </p>

      <h2>¿Cuánto tiempo conservamos tus datos?</h2>
      <p>
        Se conservan mientras exista una relación activa con el restaurante (reservas, historial
        de visitas) y, posteriormente, durante los plazos legalmente exigibles. Puedes solicitar
        su supresión en cualquier momento salvo que exista una obligación legal de conservarlos.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación
        del tratamiento y portabilidad escribiendo al restaurante donde reservaste, o a{' '}
        <span className="legal-placeholder">{legalConfig.contactEmail}</span>. También puedes
        reclamar ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        ) si consideras que no se han atendido correctamente.
      </p>

      <h2>Uso de almacenamiento local</h2>
      <p>
        El panel privado de gestión (CRM) de cada restaurante usa el almacenamiento local del
        navegador (no cookies de terceros ni de seguimiento publicitario) para mantener la
        sesión del personal autenticado. El formulario público de reserva no requiere ni usa
        almacenamiento local.
      </p>

      <Link to="/" className="legal-page-back">
        ← Volver al inicio
      </Link>
    </main>
  )
}
