// Mock user data for testing login functionality
export interface User {
  id: string
  email: string
  password: string
  name: string
  phone: string
  avatar?: string
  createdAt: Date
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@carental.com",
    password: "admin123",
    name: "Admin User",
    phone: "+1234567890",
    avatar: "/admin-avatar.png",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "john@example.com",
    password: "password123",
    name: "John Doe",
    phone: "+1234567891",
    avatar: "/male-avatar.png",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "3",
    email: "jane@example.com",
    password: "password123",
    name: "Jane Smith",
    phone: "+1234567892",
    avatar: "/diverse-female-avatar.png",
    createdAt: new Date("2024-03-20"),
  },
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
