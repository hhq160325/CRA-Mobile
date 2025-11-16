// Mock user data for testing login functionality
export interface User {
  id: string
  email: string
  password: string
  name: string
  phone: string
  avatar?: string
  role: "admin" | "staff" | "customer"
  createdAt: Date
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "Admin@carental.com",
    password: "Admin123",
    name: "Admin User",
    phone: "+1234567890",
    avatar: "/admin-avatar.png",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "Staff@carental.com",
    password: "Staff123",
    name: "John Doe",
    phone: "+1234567891",
    avatar: "/male-avatar.png",
    role: "staff",
    createdAt: new Date("2024-02-15"),
  }
]

// Helper function to validate login
export function validateLogin(email: string, password: string): User | null {
  const user = mockUsers.find((u) => u.email === email && u.password === password)
  return user || null
}

// Helper function to get user by email
export function getUserByEmail(email: string): User | null {
  return mockUsers.find((u) => u.email === email) || null
}
