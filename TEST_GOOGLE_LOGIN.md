# Test Google Login Flow

## 🧪 Cách test

### Test 1: Normal Flow
1. Mở app
2. Click "Sign in with Google"
3. Đăng nhập trên browser
4. Quan sát logs:
   ```
   === Starting Google Sign-In ===
   auth-context: Google login initiated
   === Starting Google Login ===
   Opening URL: https://...
   Browser result: { type: 'success', url: 'carapp://auth/callback?jwtToken=...' }
   ✅ Authentication successful
   ✅ Got JWT token from callback
   Decoded JWT: {...}
   ✅ Saved user data to localStorage
   auth-context: Google login successful
   auth-context: setting user from result
   === User logged in, navigating based on role ===
   ✅ Navigating to [Screen]
   ```

### Test 2: Deep Link (App đang mở)
1. Mở app
2. Mở browser và paste URL: `carapp://auth/callback?jwtToken=YOUR_TOKEN`
3. App sẽ tự động:
   - Nhận deep link
   - Parse token
   - Login user
   - Navigate

### Test 3: Deep Link (App đóng)
1. Đóng app hoàn toàn
2. Mở browser và paste URL: `carapp://auth/callback?jwtToken=YOUR_TOKEN`
3. App sẽ mở và tự động login

## 📊 Expected Logs

### Success Case
```
🔗 Deep link received: carapp://auth/callback?jwtToken=...
✅ Google OAuth callback detected
✅ JWT token found in callback, auto-logging in...
✅ Auto-login successful: user@example.com
=== User logged in, navigating based on role ===
✅ Navigating to tabStack
```

### Error Cases

#### No Token
```
🔗 Deep link received: carapp://auth/callback
✅ Google OAuth callback detected
❌ No token found in callback URL
```

#### Invalid Token
```
🔗 Deep link received: carapp://auth/callback?jwtToken=invalid
✅ Google OAuth callback detected
✅ JWT token found in callback, auto-logging in...
⚠️ Token found but no user in localStorage
```

## 🔍 Debug Commands

### Check localStorage (React Native Debugger)
```javascript
// In console
localStorage.getItem('token')
localStorage.getItem('user')
localStorage.getItem('refreshToken')
```

### Simulate Deep Link (iOS)
```bash
xcrun simctl openurl booted "carapp://auth/callback?jwtToken=YOUR_TOKEN"
```

### Simulate Deep Link (Android)
```bash
adb shell am start -W -a android.intent.action.VIEW -d "carapp://auth/callback?jwtToken=YOUR_TOKEN" com.carapp.app
```

## ✅ Success Criteria

- [ ] User click Google login → browser mở
- [ ] User đăng nhập Google thành công
- [ ] Browser redirect về app với token
- [ ] App tự động parse token
- [ ] User được set vào state
- [ ] App tự động navigate đến màn hình phù hợp
- [ ] Không cần user click thêm gì

## 🐛 Common Issues

### Issue 1: Deep link không hoạt động
**Solution:** Check app.json có `"scheme": "carapp"` chưa

### Issue 2: Token không được parse
**Solution:** Check backend redirect URL format: `carapp://auth/callback?jwtToken=...`

### Issue 3: User không được set
**Solution:** Check localStorage có hoạt động không (React Native AsyncStorage)

### Issue 4: Navigation không trigger
**Solution:** Check useEffect dependencies trong signin.screen.tsx
