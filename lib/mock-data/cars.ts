// Mock car data for testing car listing and details pages
export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: "sedan" | "suv" | "sports" | "luxury" | "electric"
  price: number
  rating: number
  reviews: number
  image: string
  images: string[]
  description: string
  features: string[]
  specs: {
    seats: number
    transmission: "Automatic" | "Manual"
    fuel: string
    mileage: string
    engine: string
    horsepower: string
  }
  available: boolean
  location: string
}

export const mockCars: Car[] = [
  {
    id: "1",
    name: "Tesla Model S",
    brand: "Tesla",
    model: "Model S",
    year: 2024,
    category: "electric",
    price: 150,
    rating: 4.9,
    reviews: 128,
    image: "/tesla-model-s-luxury.png",
    images: ["/tesla-model-s-luxury.png", "/tesla-interior.jpg", "/tesla-dashboard.jpg"],
    description:
      "Experience the future of driving with the Tesla Model S. This all-electric luxury sedan combines stunning performance with cutting-edge technology.",
    features: ["Autopilot", "Premium Sound System", "Glass Roof", "Heated Seats", "Wireless Charging"],
    specs: {
      seats: 5,
      transmission: "Automatic",
      fuel: "Electric",
      mileage: "405 miles range",
      engine: "Dual Motor AWD",
      horsepower: "670 hp",
    },
    available: true,
    location: "San Francisco, CA",
  },
  {
    id: "2",
    name: "BMW X5",
    brand: "BMW",
    model: "X5",
    year: 2024,
    category: "suv",
    price: 120,
    rating: 4.7,
    reviews: 95,
    image: "/bmw-x5-suv.png",
    images: ["/bmw-x5-suv.png", "/bmw-x5-interior.png", "/bmw-x5-trunk.jpg"],
    description:
      "The BMW X5 offers the perfect blend of luxury, performance, and versatility. Ideal for both city driving and weekend adventures.",
    features: ["Panoramic Sunroof", "Leather Seats", "Navigation", "Parking Assist", "Apple CarPlay"],
    specs: {
      seats: 7,
      transmission: "Automatic",
      fuel: "Gasoline",
      mileage: "21 MPG city / 26 MPG highway",
      engine: "3.0L Inline-6",
      horsepower: "335 hp",
    },
    available: true,
    location: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Mercedes S-Class",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    category: "luxury",
    price: 180,
    rating: 4.8,
    reviews: 156,
    image: "/mercedes-s-class-luxury.jpg",
    images: ["/mercedes-s-class-luxury.jpg", "/mercedes-s-class-interior.jpg", "/mercedes-luxury-seats.jpg"],
    description:
      "The epitome of luxury and sophistication. The Mercedes S-Class sets the standard for premium sedans worldwide.",
    features: ["Massage Seats", "Burmester Sound", "Air Suspension", "Night Vision", "Executive Rear Seats"],
    specs: {
      seats: 5,
      transmission: "Automatic",
      fuel: "Gasoline",
      mileage: "18 MPG city / 28 MPG highway",
      engine: "3.0L Inline-6 Turbo",
      horsepower: "429 hp",
    },
    available: true,
    location: "New York, NY",
  },
  {
    id: "4",
    name: "Porsche 911",
    brand: "Porsche",
    model: "911",
    year: 2024,
    category: "sports",
    price: 250,
    rating: 4.9,
    reviews: 87,
    image: "/sleek-red-sports-car.png",
    images: ["/sleek-red-sports-car.png", "/porsche-911-interior.jpg", "/porsche-engine.jpg"],
    description:
      "An icon of performance and design. The Porsche 911 delivers an unmatched driving experience with legendary handling.",
    features: ["Sport Chrono Package", "PASM Suspension", "Sport Exhaust", "Carbon Fiber Trim", "Track Mode"],
    specs: {
      seats: 4,
      transmission: "Automatic",
      fuel: "Gasoline",
      mileage: "18 MPG city / 24 MPG highway",
      engine: "3.0L Twin-Turbo Flat-6",
      horsepower: "443 hp",
    },
    available: true,
    location: "Miami, FL",
  },
  {
    id: "5",
    name: "Audi A8",
    brand: "Audi",
    model: "A8",
    year: 2024,
    category: "luxury",
    price: 160,
    rating: 4.6,
    reviews: 72,
    image: "/luxury-sedan.png",
    images: ["/luxury-sedan.png", "/audi-a8-interior.jpg", "/audi-technology.jpg"],
    description:
      "The Audi A8 combines cutting-edge technology with refined luxury. Experience the pinnacle of German engineering.",
    features: ["Matrix LED Lights", "Virtual Cockpit", "Bang & Olufsen Audio", "Quattro AWD", "Adaptive Cruise"],
    specs: {
      seats: 5,
      transmission: "Automatic",
      fuel: "Gasoline",
      mileage: "17 MPG city / 26 MPG highway",
      engine: "3.0L V6 Turbo",
      horsepower: "335 hp",
    },
    available: true,
    location: "Chicago, IL",
  },
  {
    id: "6",
    name: "Range Rover Sport",
    brand: "Land Rover",
    model: "Range Rover Sport",
    year: 2024,
    category: "suv",
    price: 140,
    rating: 4.7,
    reviews: 103,
    image: "/luxury-suv.png",
    images: ["/luxury-suv.png", "/range-rover-interior.jpg", "/range-rover-offroad.jpg"],
    description:
      "Uncompromising luxury meets exceptional capability. The Range Rover Sport is ready for any adventure.",
    features: [
      "Terrain Response",
      "Meridian Sound",
      "Adaptive Dynamics",
      "Wade Sensing",
      "Configurable Ambient Lighting",
    ],
    specs: {
      seats: 7,
      transmission: "Automatic",
      fuel: "Gasoline",
      mileage: "16 MPG city / 23 MPG highway",
      engine: "3.0L Inline-6 Turbo",
      horsepower: "355 hp",
    },
    available: true,
    location: "Seattle, WA",
  },
]

// Helper functions
export function getCarById(id: string): Car | undefined {
  return mockCars.find((car) => car.id === id)
}

export function getCarsByCategory(category: string): Car[] {
  if (category === "all") return mockCars
  return mockCars.filter((car) => car.category === category)
}

export function searchCars(query: string): Car[] {
  const lowerQuery = query.toLowerCase()
  return mockCars.filter(
    (car) =>
      car.name.toLowerCase().includes(lowerQuery) ||
      car.brand.toLowerCase().includes(lowerQuery) ||
      car.model.toLowerCase().includes(lowerQuery),
  )
}
