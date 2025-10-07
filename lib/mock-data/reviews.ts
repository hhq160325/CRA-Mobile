// Mock review data for car details page
export interface Review {
  id: string
  carId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: Date
  helpful: number
}

export const mockReviews: Review[] = [
  {
    id: "R001",
    carId: "1",
    userId: "2",
    userName: "John Doe",
    userAvatar: "/male-avatar.png",
    rating: 5,
    comment:
      "Amazing car! The Tesla Model S exceeded all my expectations. Smooth ride, incredible acceleration, and the autopilot feature is mind-blowing.",
    date: new Date("2024-11-20"),
    helpful: 24,
  },
  {
    id: "R002",
    carId: "1",
    userId: "3",
    userName: "Jane Smith",
    userAvatar: "/diverse-female-avatar.png",
    rating: 5,
    comment: "Perfect for a weekend getaway. The range was more than enough and charging was convenient.",
    date: new Date("2024-11-15"),
    helpful: 18,
  },
  {
    id: "R003",
    carId: "2",
    userId: "2",
    userName: "John Doe",
    userAvatar: "/male-avatar.png",
    rating: 5,
    comment: "The BMW X5 is spacious and comfortable. Great for family trips!",
    date: new Date("2024-10-25"),
    helpful: 15,
  },
  {
    id: "R004",
    carId: "3",
    userId: "3",
    userName: "Jane Smith",
    userAvatar: "/diverse-female-avatar.png",
    rating: 5,
    comment: "Pure luxury! The Mercedes S-Class made me feel like royalty. Every detail is perfect.",
    date: new Date("2024-11-10"),
    helpful: 32,
  },
  {
    id: "R005",
    carId: "4",
    userId: "2",
    userName: "John Doe",
    userAvatar: "/male-avatar.png",
    rating: 5,
    comment: "Dream car! The Porsche 911 is an absolute beast. The handling and power are incredible.",
    date: new Date("2024-11-18"),
    helpful: 41,
  },
]

// Helper functions
export function getReviewsByCarId(carId: string): Review[] {
  return mockReviews.filter((review) => review.carId === carId)
}

export function getAverageRating(carId: string): number {
  const reviews = getReviewsByCarId(carId)
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}
