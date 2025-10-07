# API Service Layer - Hướng dẫn sử dụng

## 📋 Tổng quan

Tất cả API calls được tập trung trong thư mục `lib/api/`. Hiện tại đang sử dụng **mock data**, khi API backend sẵn sàng, bạn chỉ cần thay đổi **1 dòng code** để chuyển sang API thật.

## 🔄 Cách chuyển từ Mock Data sang Real API

### Bước 1: Cập nhật config (CHỈ 1 DÒNG)

Mở file `lib/api/config.ts` và thay đổi:

\`\`\`typescript
export const API_CONFIG = {
  USE_MOCK_DATA: false, // ⬅️ Đổi từ true sang false
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.yourdomain.com",
  TIMEOUT: 10000,
}
\`\`\`

### Bước 2: Thêm environment variable

Tạo file `.env.local` và thêm:

\`\`\`
NEXT_PUBLIC_API_URL=https://your-real-api.com
\`\`\`

### Bước 3: Đảm bảo API endpoints khớp với backend

Kiểm tra `API_ENDPOINTS` trong `lib/api/config.ts` có khớp với routes của backend không:

\`\`\`typescript
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",           // ⬅️ Phải khớp với backend
  CARS: "/cars",                  // ⬅️ Phải khớp với backend
  BOOKINGS: "/bookings",          // ⬅️ Phải khớp với backend
  // ... các endpoints khác
}
\`\`\`

**Xong!** Tất cả các trang sẽ tự động sử dụng API thật.

---

## 📁 Cấu trúc thư mục

\`\`\`
lib/api/
├── config.ts              # ⚙️ Cấu hình API (toggle mock/real ở đây)
├── client.ts              # 🔌 HTTP client với error handling
├── index.ts               # 📦 Export tất cả services
└── services/
    ├── auth.service.ts    # 🔐 Authentication APIs
    ├── cars.service.ts    # 🚗 Cars APIs
    ├── bookings.service.ts # 📅 Bookings APIs
    └── reviews.service.ts  # ⭐ Reviews APIs
\`\`\`

---

## 🎯 Cách sử dụng trong components

### Ví dụ: Lấy danh sách xe

\`\`\`tsx
import { api } from '@/lib/api'

export default function CarsPage() {
  const [cars, setCars] = useState([])
  
  useEffect(() => {
    async function loadCars() {
      const { data, error } = await api.cars.getCars()
      if (data) setCars(data)
    }
    loadCars()
  }, [])
  
  return <div>{/* render cars */}</div>
}
\`\`\`

### Ví dụ: Login

\`\`\`tsx
import { api } from '@/lib/api'

async function handleLogin(email: string, password: string) {
  const { data, error } = await api.auth.login(email, password)
  
  if (error) {
    toast.error(error.message)
    return
  }
  
  if (data) {
    // Login thành công
    router.push('/dashboard')
  }
}
\`\`\`

---

## 🔧 Tùy chỉnh API response format

Nếu backend của bạn trả về format khác, chỉnh sửa `apiClient` trong `lib/api/client.ts`:

\`\`\`typescript
// Ví dụ: Backend trả về { success: true, result: {...}, message: "" }
export async function apiClient<T>(endpoint: string, options?: RequestInit) {
  const response = await fetch(url, config)
  const json = await response.json()
  
  // Thay đổi ở đây để match với format của bạn
  return {
    data: json.result as T,  // ⬅️ Thay đổi theo format backend
    error: json.success ? null : new Error(json.message)
  }
}
\`\`\`

---

## 📝 Thêm API mới

### 1. Thêm endpoint vào config.ts

\`\`\`typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  FAVORITES: "/user/favorites",  // ⬅️ Thêm endpoint mới
}
\`\`\`

### 2. Tạo service mới (hoặc thêm vào service có sẵn)

\`\`\`typescript
// lib/api/services/favorites.service.ts
export const favoritesService = {
  async getFavorites() {
    if (API_CONFIG.USE_MOCK_DATA) {
      return { data: mockFavorites, error: null }
    }
    return await apiClient(API_ENDPOINTS.FAVORITES)
  }
}
\`\`\`

### 3. Export trong index.ts

\`\`\`typescript
export const api = {
  // ... existing services
  favorites: favoritesService,  // ⬅️ Thêm service mới
}
\`\`\`

---

## ✅ Checklist khi chuyển sang Production

- [ ] Đổi `USE_MOCK_DATA: false` trong `config.ts`
- [ ] Thêm `NEXT_PUBLIC_API_URL` vào environment variables
- [ ] Kiểm tra tất cả API endpoints khớp với backend
- [ ] Test authentication flow (login/logout)
- [ ] Test error handling với API thật
- [ ] Kiểm tra CORS settings trên backend
- [ ] Thêm loading states cho tất cả API calls
- [ ] Thêm error boundaries cho error handling

---

## 🐛 Troubleshooting

### API không hoạt động sau khi đổi sang real API?

1. Kiểm tra `NEXT_PUBLIC_API_URL` đã được set chưa
2. Mở DevTools → Network tab để xem request/response
3. Kiểm tra CORS settings trên backend
4. Verify API endpoints khớp với backend

### Mock data không hiển thị?

1. Kiểm tra `USE_MOCK_DATA: true` trong `config.ts`
2. Kiểm tra mock data files trong `lib/mock-data/`
3. Xem console có error không

---

## 💡 Best Practices

✅ **DO:**
- Luôn handle cả `data` và `error` từ API calls
- Thêm loading states khi fetch data
- Show error messages cho users
- Use TypeScript types cho API responses

❌ **DON'T:**
- Gọi API trực tiếp từ components (dùng services)
- Hardcode API URLs trong components
- Bỏ qua error handling
- Fetch data trong useEffect mà không cleanup
