function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Genera los huecos reservables entre apertura y cierre, en pasos de
 * `stepMinutes`. El último hueco deja sitio a una comida completa
 * (`durationMinutes`) antes del cierre.
 */
export function generateTimeSlots(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  durationMinutes: number,
  stepMinutes = 30,
): string[] {
  if (!openTime || !closeTime) return []

  const openMinutes = toMinutes(openTime)
  const closeMinutes = toMinutes(closeTime)
  const lastStart = closeMinutes - durationMinutes

  const slots: string[] = []
  for (let t = openMinutes; t <= lastStart; t += stepMinutes) {
    slots.push(toTimeString(t))
  }
  return slots
}
