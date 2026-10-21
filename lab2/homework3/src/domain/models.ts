export interface Product {
    id: string
    name: string
    originalPrice: number
    salePrice: number
}

export interface Inventory {
    productId: string
    total: number
    available: number
    reserved: number
    sold: number
    version: number
}

export interface FlashSale {
    id: string
    productId: string
    startsAt: number
    endsAt: number
}

export type ReservationStatus =
    | 'ACTIVE'
    | 'CONFIRMED'
    | 'EXPIRED'
    | 'CANCELLED'

export interface Reservation {
    id: string
    productId: string
    userId: string
    quantity: number
    status: ReservationStatus
    expiresAt: number
}

export interface Order {
    id: string
    reservationId: string
    userId: string
    quantity: number
    totalAmount: number
    createdAt: number
}