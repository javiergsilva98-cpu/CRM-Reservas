export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'seated'
  | 'no_show'

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  seated: 'Sentados',
  no_show: 'No-show',
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  timezone: string
  phone: string | null
  email: string | null
  address: string | null
  active: boolean
  owner_email: string | null
  created_at: string
}

export interface Reservation {
  id: string
  restaurant_id: string
  customer_id: string
  party_size: number
  reservation_date: string
  reservation_time: string
  status: ReservationStatus
  customer_notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export interface ReservationWithCustomer extends Reservation {
  customers: Pick<
    Customer,
    'id' | 'first_name' | 'last_name' | 'phone' | 'email'
  > | null
}

export interface Customer {
  id: string
  restaurant_id: string
  first_name: string
  last_name: string | null
  phone: string | null
  email: string | null
  language: string
  gdpr_marketing: boolean
  gdpr_consent_at: string | null
  birthday: string | null
  allergies: string[]
  diet: string[]
  preferences: Record<string, unknown> | null
  notes: string | null
  tags: string[]
  company: string | null
  acquisition_channel: string | null
  no_show_count: number
  cancel_count: number
  visits_count: number
  total_spent: number
  last_visit_at: string | null
  created_at: string
}

export interface RestaurantTable {
  id: string
  restaurant_id: string
  name: string
  capacity: number
  active: boolean
  created_at: string
}

export interface RestaurantHours {
  id: string
  restaurant_id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  closed: boolean
}
