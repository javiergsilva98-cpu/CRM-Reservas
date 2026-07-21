interface IconProps {
  className?: string
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 4l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PartyIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="13.5" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M2 16c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4M10 16c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.35" />
      <path d="M10 6v4l2.6 1.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M3.5 17c.9-3.4 3.6-5.3 6.5-5.3s5.6 1.9 6.5 5.3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.5 3h2l1 3.5-1.7 1.3a9 9 0 0 0 4.4 4.4l1.3-1.7 3.5 1v2c0 1-.9 1.9-1.9 1.7-5.6-.9-9.9-5.2-10.8-10.8C3.1 3.9 4 3 5.5 3Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="m3 5.5 7 5.5 7-5.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NoteIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 3.5h10v13l-2.5-1.6L10 16.4l-2.5-1.5L5 16.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M7.2 7.5h5.6M7.2 10.3h5.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}
