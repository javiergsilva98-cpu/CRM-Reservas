import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

/** Sin VITE_SENTRY_DSN no hace nada: útil en local sin cuenta de Sentry. */
export function initSentry() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
  })
}

export { Sentry }
