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
