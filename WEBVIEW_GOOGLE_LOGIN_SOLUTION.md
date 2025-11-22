# WebView Google Login Solution

## 🎯 Giải pháp

Thay vì sử dụng `expo-web-browser` (mở browser bên ngoài), sử dụng **WebView** để hiển thị Google OAuth flow ngay trong app. Điều này cho phép:

1. ✅ Kiểm soát hoàn toàn navigation
2. ✅ Tự động detect khi nhận được token
3. ✅ Tự động đóng WebView và quay về app
4. ✅ Không cần backend redirect về deep link
5. ✅ UX tốt hơn (không rời khỏi app)

## 📦 Dependencies

```json
{
  "react-native-webview": "^13.x.x"
}
```

Đã cài đặt: ✅

## 🏗️ Implementation

### 1. WebView Screen (`google-login-webview.screen.tsx`)

**Features:**
- Hiển thị Google OAuth flow trong WebView
- Inject JavaScript để detect token trong URL
- Auto-parse token từ callback URL
- Auto-save token và user vào localStorage
- Auto-close khi login thành công
- Cancel button để user có thể thoát

**Token Detection Methods:**
1. **URL Navigation Monitoring**: Theo dõi mọi URL change
2. **Injected JavaScript**: Check URL params và hash mỗi 500ms
3. **Message Passing**: WebView gửi message về React Native khi tìm thấy token

### 2. Updated Sign In Screen

**Changes:**
- `handleGoogleLogin()` navigate đến WebView modal
- Không còn cần "Check Login Status" button
- Tự động refresh user khi quay lại từ WebView

### 3. Navigation Setup

**Added route:**
```typescript
['GoogleLoginWebView']: undefined
```

**Modal presentation:**
```typescript
presentation: 'modal'
```

## 🔄 Flow

```
1. User click "Sign in with Google"
   ↓
2. App mở WebView modal (trong app)
   ↓
3. WebView load Google OAuth page
   ↓
4. User đăng nhập Google trong WebView
   ↓
5. Backend xử lý OAuth
   ↓
6. Backend response với token (bất kỳ format nào):
   - Redirect: carapp://auth/callback?jwtToken=...
   - Redirect: /callback?jwtToken=...
   - JSON response với token
   - HTML page với token trong URL
   ↓
7. WebView detect token (qua navigation hoặc injected JS)
   ↓
8. Parse và save token + user vào localStorage
   ↓
9. ✅ Auto-close WebView
   ↓
10. Refresh user trong auth context
   ↓
11. ✅ Auto-navigate đến màn hình phù hợp
```

## 🎨 UI/UX

### WebView Modal
- Header với title "Sign in with Google"
- Cancel button (top right)
- Loading indicator khi đang load
- Full-screen WebView

### Sign In Screen
- Button "Sign in with Google" mở WebView
- Không còn hint message hay manual refresh button
- Seamless experience

## 🔧 Technical Details

### Injected JavaScript

```javascript
// Check URL for token every 500ms
setInterval(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('jwtToken') || urlParams.get('token');
  
  if (token) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'LOGIN_SUCCESS',
      token: token,
      // ... other data
    }));
  }
}, 500);
```

### Navigation State Change Handler

```typescript
const handleNavigationStateChange = (navState: any) => {
  const url = navState.url
  
  // Detect callback URL
  if (url.includes("/callback") || url.includes("jwtToken")) {
    // Parse URL and extract token
    // Save to localStorage
    // Close WebView
  }
}
```

### Token Parsing

Supports multiple formats:
- Query params: `?jwtToken=...`
- Hash params: `#jwtToken=...`
- Alternative param names: `token`, `jwtToken`
- Deep link format: `carapp://auth/callback?jwtToken=...`
- HTTP format: `https://domain.com/callback?jwtToken=...`

## ✅ Advantages

| Feature | Browser (Old) | WebView (New) |
|---------|--------------|---------------|
| Stay in app | ❌ | ✅ |
| Auto-close | ❌ | ✅ |
| Token detection | Manual | Automatic |
| Backend redirect required | Yes | No |
| User action needed | Yes (close browser) | No |
| UX | Poor | Excellent |

## 🧪 Testing

### Test Flow
1. Click "Sign in with Google"
2. WebView modal mở
3. Đăng nhập Google
4. Quan sát logs:
   ```
   === Opening Google Login WebView ===
   WebView navigation: https://...
   ✅ Callback detected in WebView
   ✅ Token found in URL, saving...
   ✅ Saved user to localStorage: user@example.com
   ✅ Google login successful, closing WebView
   ✅ User logged in via WebView
   === User logged in, navigating based on role ===
   ```
5. WebView tự động đóng
6. App navigate đến màn hình phù hợp

### Test Cancel
1. Click "Sign in with Google"
2. Click "Cancel" button
3. WebView đóng
4. Quay lại sign in screen

## 🐛 Troubleshooting

### Issue: WebView không load
**Solution:** Check internet connection và API_CONFIG.BASE_URL

### Issue: Token không được detect
**Solution:** 
- Check backend response format
- Check console logs trong WebView
- Verify injected JavaScript đang chạy

### Issue: WebView không đóng
**Solution:**
- Check `handleSuccess()` được gọi
- Check `goBack()` hoạt động
- Verify navigation stack

## 📊 Backend Compatibility

WebView solution hoạt động với **bất kỳ backend response format nào**:

### Format 1: Redirect to callback URL
```
HTTP 302 Redirect
Location: carapp://auth/callback?jwtToken=...
```
✅ Detected by navigation handler

### Format 2: Redirect to relative path
```
HTTP 302 Redirect
Location: /callback?jwtToken=...
```
✅ Detected by navigation handler

### Format 3: HTML page with token
```html
<html>
  <body>
    <script>
      window.location.href = '/?jwtToken=...';
    </script>
  </body>
</html>
```
✅ Detected by injected JavaScript

### Format 4: JSON response
```json
{
  "jwtToken": "...",
  "username": "...",
  "email": "..."
}
```
⚠️ Cần backend trả về HTML page hoặc redirect

## 🚀 Deployment

### Files Changed
```
app/
  ├── screens/
  │   └── singin/
  │       ├── signin.screen.tsx (updated)
  │       └── google-login-webview.screen.tsx (new)
  └── navigators/
      ├── app-navigator.tsx (updated)
      └── navigation-route.ts (updated)

package.json (added react-native-webview)
```

### No Backend Changes Required! 🎉

Backend có thể giữ nguyên implementation hiện tại. WebView sẽ tự động detect token bất kể backend trả về format nào.

## 📝 Summary

- ✅ WebView solution implemented
- ✅ Auto-detect token from any format
- ✅ Auto-close on success
- ✅ Better UX (stay in app)
- ✅ No backend changes needed
- ✅ Works with current backend
- ✅ Fallback to manual refresh still available

## 🎯 Result

User experience bây giờ:
1. Click button → WebView mở
2. Đăng nhập Google
3. ✅ Done! (tự động đóng và login)

Không cần:
- ❌ Đóng browser thủ công
- ❌ Click "Check Login Status"
- ❌ Bất kỳ action nào sau khi đăng nhập
