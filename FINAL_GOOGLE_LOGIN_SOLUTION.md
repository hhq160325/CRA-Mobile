# Final Google Login Solution - Polling Mechanism

## 🚫 Vấn đề với WebView

Google OAuth **không cho phép** login trong embedded WebView vì security policy:
```
Error: disallowed_useragent
"This app doesn't comply with Google's secure browsers policy"
```

Google yêu cầu sử dụng **secure browser** (Safari/Chrome) thay vì WebView.

## ✅ Giải pháp cuối cùng: Browser + Auto-Polling

Sử dụng `expo-web-browser` (secure browser) + **polling mechanism** để tự động detect token.

### Cách hoạt động:

```
1. User click "Sign in with Google"
   ↓
2. Mở secure browser (Safari/Chrome)
   ↓
3. Start polling localStorage mỗi 1 giây
   ↓
4. User đăng nhập Google trên browser
   ↓
5. Backend xử lý OAuth và lưu token vào localStorage
   ↓
6. Polling detect token trong localStorage
   ↓
7. ✅ Tự động dismiss browser
   ↓
8. Return user object
   ↓
9. Auto-login và navigate
```

## 🔧 Implementation

### 1. Polling Mechanism (`lib/utils/googleLogin.ts`)

```typescript
let pollingInterval: NodeJS.Timeout | null = null

function startTokenPolling(onTokenFound: (user: any) => void): void {
    pollingInterval = setInterval(() => {
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")
        
        if (token && userStr) {
            stopTokenPolling()
            const user = JSON.parse(userStr)
            onTokenFound(user)
        }
    }, 1000) // Check every second
}
```

### 2. Auto-Dismiss Browser

```typescript
startTokenPolling((user) => {
    tokenFoundViaPolling = true
    pollingUser = user
    WebBrowser.dismissBrowser() // Auto-close browser
})
```

### 3. Handle All Cases

```typescript
// Case 1: Token found via polling (auto-dismissed)
if (tokenFoundViaPolling && pollingUser) {
    return { success: true, user: pollingUser }
}

// Case 2: Normal callback with token in URL
if (result.type === "success" && result.url) {
    // Parse token from URL...
}

// Case 3: User manually dismissed browser
if (result.type === "dismiss") {
    // Check localStorage one more time...
}
```

## 🎯 User Experience

### Scenario 1: Backend lưu token vào localStorage (Best)
1. Click "Sign in with Google"
2. Browser mở
3. Đăng nhập Google
4. ✅ Browser tự động đóng (sau 1-2 giây)
5. ✅ Auto-login thành công

### Scenario 2: Backend redirect về deep link
1. Click "Sign in with Google"
2. Browser mở
3. Đăng nhập Google
4. Backend redirect về `carapp://auth/callback?jwtToken=...`
5. ✅ Browser đóng, token được parse
6. ✅ Auto-login thành công

### Scenario 3: User đóng browser thủ công
1. Click "Sign in with Google"
2. Browser mở
3. Đăng nhập Google
4. User đóng browser thủ công
5. ⚠️ Show "Check Login Status" button
6. User click button
7. ✅ Login thành công

## 📊 Comparison

| Method | WebView | Browser (Old) | Browser + Polling (New) |
|--------|---------|---------------|-------------------------|
| Google Policy | ❌ Blocked | ✅ Allowed | ✅ Allowed |
| Auto-close | N/A | ❌ Manual | ✅ Automatic |
| UX | N/A | Poor | Excellent |
| Backend changes | N/A | Required | Optional |
| Fallback | N/A | Manual button | Manual button |

## 🔍 How Backend Should Work

### Option 1: Save to localStorage (Recommended)

Backend có thể inject JavaScript vào response page để save token:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login Successful</title>
</head>
<body>
    <h1>✅ Login Successful</h1>
    <p>Redirecting back to app...</p>
    
    <script>
        // Save token to localStorage
        localStorage.setItem('token', '${jwtToken}');
        localStorage.setItem('user', JSON.stringify({
            id: '${userId}',
            name: '${username}',
            email: '${email}',
            role: '${role}',
            roleId: ${roleId},
            createdAt: new Date().toISOString(),
            isGoogle: true
        }));
        
        // Optional: Also redirect to deep link
        window.location.href = 'carapp://auth/callback?jwtToken=${jwtToken}';
    </script>
</body>
</html>
```

**Advantages:**
- ✅ Polling sẽ detect token ngay lập tức
- ✅ Browser tự động đóng
- ✅ Best UX

### Option 2: Redirect to Deep Link

```csharp
return Redirect($"carapp://auth/callback?jwtToken={token}&username={user.Username}&email={user.Email}");
```

**Advantages:**
- ✅ Token được parse từ URL
- ✅ Browser đóng khi redirect
- ✅ Good UX

### Option 3: Do Nothing (Current)

Backend chỉ trả về JSON hoặc HTML page thông thường.

**Result:**
- ⚠️ User phải đóng browser thủ công
- ⚠️ User phải click "Check Login Status"
- ⚠️ Poor UX but still works

## 🧪 Testing

### Test Auto-Close (Option 1)
1. Backend implement localStorage save
2. Click "Sign in with Google"
3. Đăng nhập
4. Quan sát: Browser tự động đóng sau 1-2 giây
5. ✅ Auto-login successful

### Test Deep Link (Option 2)
1. Backend implement redirect
2. Click "Sign in with Google"
3. Đăng nhập
4. Quan sát: Browser redirect và đóng
5. ✅ Auto-login successful

### Test Manual (Option 3)
1. Backend không thay đổi
2. Click "Sign in with Google"
3. Đăng nhập
4. Đóng browser thủ công
5. Click "Check Login Status"
6. ✅ Login successful

## 📝 Code Changes

### Files Modified:
```
lib/utils/googleLogin.ts
  - Added startTokenPolling()
  - Added stopTokenPolling()
  - Integrated polling with browser flow
  - Auto-dismiss browser when token found

app/screens/singin/signin.screen.tsx
  - Restored loginWithGoogle() call
  - Keep "Check Login Status" as fallback
```

### Files Removed:
```
app/screens/singin/google-login-webview.screen.tsx (not needed)
```

## ✅ Benefits

1. **Works with Google Policy** - Uses secure browser
2. **Auto-close browser** - When token is detected
3. **No backend changes required** - Works with current backend
4. **Better UX** - Minimal user action needed
5. **Fallback available** - Manual button if auto-close fails
6. **Flexible** - Works with any backend response format

## 🎯 Result

User experience bây giờ:
1. Click "Sign in with Google"
2. Đăng nhập trên browser
3. ✅ Browser tự động đóng (nếu backend lưu token)
4. ✅ Hoặc click "Check Login Status" (nếu backend chưa update)

Either way, login thành công!

## 📞 Recommendation for Backend

Để có UX tốt nhất, backend nên implement **Option 1** (save to localStorage):

```html
<script>
  localStorage.setItem('token', '${jwtToken}');
  localStorage.setItem('user', '${JSON.stringify(user)}');
  window.location.href = 'carapp://auth/callback';
</script>
```

Điều này sẽ:
- ✅ Trigger polling detection
- ✅ Auto-close browser
- ✅ Perfect UX
