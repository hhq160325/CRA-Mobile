# Google Login - Automatic Flow

## 🎯 Vấn đề đã fix
Code trước đây dừng lại sau khi nhận JWT token từ callback URL và không tự động hoàn tất đăng nhập.

## ✅ Giải pháp

### 1. Deep Link Listener (auth-context.tsx)
- Tự động lắng nghe deep link `carapp://auth/callback`
- Parse JWT token từ callback URL
- Tự động load user từ localStorage và set vào state
- Hoạt động cả khi app đang mở hoặc được mở từ deep link

### 2. Return User Object (googleLogin.ts)
- `performGoogleLogin()` bây giờ luôn return `{ success: true, user }` thay vì chỉ `{ success: true }`
- User object được tạo từ decoded JWT token
- Đảm bảo user data luôn có sẵn ngay sau khi login

### 3. Auto Navigation (signin.screen.tsx)
- `useEffect` theo dõi user state
- Tự động navigate đến màn hình phù hợp khi user được set:
  - Staff → StaffScreen
  - Customer/Car-owner → Home (tabStack)

## 🔄 Flow hoàn chỉnh

```
1. User click "Sign in with Google"
   ↓
2. App mở browser với URL: /api/Authen/login/google
   ↓
3. User đăng nhập Google trên browser
   ↓
4. Backend xử lý OAuth và redirect về: carapp://auth/callback?jwtToken=...
   ↓
5. App nhận deep link (Linking listener)
   ↓
6. performGoogleLogin() parse token và lưu vào localStorage
   ↓
7. Return user object về auth-context
   ↓
8. auth-context set user vào state
   ↓
9. signin.screen useEffect detect user change
   ↓
10. Auto navigate đến màn hình phù hợp
   ↓
11. ✅ Đăng nhập hoàn tất!
```

## 🔧 Code changes

### lib/auth-context.tsx
- Added `Linking` import
- Added deep link listener trong `useEffect`
- Listener tự động parse callback URL và set user
- Updated `loginWithGoogle()` để handle user từ result

### lib/utils/googleLogin.ts
- Fixed return statement để luôn return user object
- Đảm bảo user được tạo trong mọi trường hợp (localStorage available hay không)

## 📱 Testing

1. Click "Sign in with Google" button
2. Đăng nhập trên browser
3. App sẽ tự động:
   - Nhận callback URL
   - Parse và lưu token
   - Set user vào state
   - Navigate đến màn hình phù hợp

## 🐛 Debug logs

Các log quan trọng để theo dõi:
- `🔗 Deep link received:` - Deep link được nhận
- `✅ Google OAuth callback detected` - Callback được detect
- `✅ JWT token found in callback, auto-logging in...` - Token được tìm thấy
- `✅ Auto-login successful:` - Login tự động thành công
- `✅ Navigating to [Screen]` - Navigation được trigger

## ⚠️ Lưu ý

- Deep link scheme `carapp://` phải được config trong app.json (✅ đã có)
- Backend phải redirect về đúng URL: `carapp://auth/callback?jwtToken=...`
- Token phải được truyền qua query params hoặc hash fragment
