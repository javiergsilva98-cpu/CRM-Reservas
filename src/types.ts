export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'seated'
  | 'no_show'

export interface Restaurant {
  id: string
  slug: string
  name: string
  timezone: string
  phone: string | null
  email: string | null
  address: string | null
  active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  restaurant_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: ReservationStatus
  notes: string | null
  created_at: string
  updated_at: string
}
