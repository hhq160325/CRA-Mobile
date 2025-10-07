// Mock booking data for testing bookings page
export interface Booking {
  id: string
  userId: string
  carId: string
  carName: string
  carImage: string
  startDate: Date
  endDate: Date
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number
  status: "upcoming" | "completed" | "cancelled"
  bookingDate: Date
  addOns: string[]
}

export const mockBookings: Booking[] = [
  {
    id: "BK001",
    userId: "2",
    carId: "1",
    carName: "Tesla Model S",
    carImage: "/tesla-model-s-luxury.png",
    startDate: new Date("2024-12-20"),
    endDate: new Date("2024-12-25"),
    pickupLocation: "San Francisco Airport",
    dropoffLocation: "San Francisco Airport",
    totalPrice: 750,
    status: "upcoming",
    bookingDate: new Date("2024-12-01"),
    addOns: ["GPS Navigation", "Child Seat"],
  },
  {
    id: "BK002",
    userId: "2",
    carId: "4",
    carName: "Porsche 911",
    carImage: "/sleek-red-sports-car.png",
    startDate: new Date("2024-11-15"),
    endDate: new Date("2024-11-17"),
    pickupLocation: "Miami Downtown",
    dropoffLocation: "Miami Downtown",
    totalPrice: 500,
    status: "completed",
    bookingDate: new Date("2024-11-01"),
    addOns: ["Insurance Coverage"],
  },
  {
    id: "BK003",
    userId: "2",
    carId: "2",
    carName: "BMW X5",
    carImage: "/bmw-x5-suv.png",
    startDate: new Date("2024-10-10"),
    endDate: new Date("2024-10-12"),
    pickupLocation: "Los Angeles Airport",
    dropoffLocation: "Los Angeles Airport",
    totalPrice: 240,
    status: "cancelled",
    bookingDate: new Date("2024-10-01"),
    addOns: [],
  },
  {
    id: "BK004",
    userId: "3",
    carId: "3",
    carName: "Mercedes S-Class",
    carImage: "/mercedes-s-class-luxury.jpg",
    startDate: new Date("2024-12-28"),
    endDate: new Date("2025-01-02"),
    pickupLocation: "New York JFK Airport",
    dropoffLocation: "New York JFK Airport",
    totalPrice: 900,
    status: "upcoming",
    bookingDate: new Date("2024-12-05"),
    addOns: ["Chauffeur Service", "Airport Pickup"],
  },
]

// Helper functions
export function getBookingsByUserId(userId: string): Booking[] {
  return mockBookings.filter((booking) => booking.userId === userId)
}

export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find((booking) => booking.id === id)
}

export function getBookingsByStatus(userId: string, status: "upcoming" | "completed" | "cancelled"): Booking[] {
  return mockBookings.filter((booking) => booking.userId === userId && booking.status === status)
}
