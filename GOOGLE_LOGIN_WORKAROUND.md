# Google Login - Workaround (Tạm thời)

## 🔴 Vấn đề

Backend chưa redirect về app sau khi Google login thành công, khiến browser dừng lại ở trang callback.

## 🛠️ Workaround Options

### Option 1: Manual Close Browser (Đơn giản nhất)

**Hướng dẫn user:**

1. Click "Sign in with Google"
2. Đăng nhập Google trên browser
3. Sau khi thấy trang callback (có thể là trang trắng hoặc JSON response)
4. **Đóng browser thủ công** (swipe down/back button)
5. Quay lại app
6. App sẽ tự động login nếu token đã được lưu

**Pros:**
- Không cần code changes
- Hoạt động ngay

**Cons:**
- User experience không tốt
- Cần hướng dẫn user

### Option 2: Add Manual Refresh Button

Thêm button "Already logged in? Tap here" trên signin screen:

```typescript
// In signin.screen.tsx

const [showRefreshHint, setShowRefreshHint] = useState(false)

const handleGoogleLogin = async () => {
  setIsLoading(true)
  setShowRefreshHint(false)
  
  try {
    const success = await loginWithGoogle()
    
    if (success) {
      setJustLoggedIn(true)
    } else {
      // Show hint to manually close browser and refresh
      setShowRefreshHint(true)
    }
  } catch (err) {
    setShowRefreshHint(true)
  } finally {
    setIsLoading(false)
  }
}

const handleManualRefresh = () => {
  const { refreshUser } = useAuth()
  refreshUser()
  
  const currentUser = authService.getCurrentUser()
  if (currentUser) {
    setJustLoggedIn(true)
  } else {
    Alert.alert("Not logged in", "Please complete Google login in browser first")
  }
}

// In render:
{showRefreshHint && (
  <View style={styles.hintContainer}>
    <Text style={styles.hintText}>
      If you completed Google login, close the browser and tap below:
    </Text>
    <Button
      text="I've logged in, refresh"
      onPress={handleManualRefresh}
    />
  </View>
)}
```

### Option 3: Polling for Token (Automatic)

Tự động check localStorage mỗi giây khi browser đang mở:

```typescript
// In lib/utils/googleLogin.ts

export async function performGoogleLogin(): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
        console.log("=== Starting Google Login ===")

        const googleLoginUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`
        
        // Start polling for token in background
        let pollInterval: NodeJS.Timeout | null = null
        let tokenFound = false
        
        const checkForToken = () => {
            try {
                if (typeof localStorage !== "undefined" && localStorage?.getItem) {
                    const token = localStorage.getItem("token")
                    const userStr = localStorage.getItem("user")
                    
                    if (token && userStr && !tokenFound) {
                        tokenFound = true
                        console.log("✅ Token found via polling!")
                        
                        if (pollInterval) {
                            clearInterval(pollInterval)
                        }
                        
                        // Close browser programmatically
                        WebBrowser.dismissBrowser()
                    }
                }
            } catch (e) {
                console.error("Polling error:", e)
            }
        }
        
        // Start polling every 1 second
        pollInterval = setInterval(checkForToken, 1000)
        
        // Open browser
        const result = await WebBrowser.openAuthSessionAsync(
            googleLoginUrl,
            "carapp://auth/callback"
        )
        
        // Stop polling
        if (pollInterval) {
            clearInterval(pollInterval)
        }
        
        // Check if token was found during polling
        if (tokenFound) {
            const userStr = localStorage.getItem("user")
            if (userStr) {
                const user = JSON.parse(userStr)
                return { success: true, user }
            }
        }
        
        // Continue with normal flow...
        // ... rest of existing code
    } catch (error: any) {
        console.error("❌ Google login error:", error)
        return {
            success: false,
            error: error.message || "An error occurred during Google login",
        }
    }
}
```

### Option 4: Backend Proxy (Best but requires backend work)

Tạo một endpoint mới trên backend để mobile app gọi:

```typescript
// Mobile app calls this instead
const response = await fetch(`${API_CONFIG.BASE_URL}/Authen/mobile/google-login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    googleIdToken: googleIdToken // Get from Google Sign-In SDK
  })
})

const { jwtToken, user } = await response.json()
```

Backend endpoint:
```csharp
[HttpPost("mobile/google-login")]
public async Task<IActionResult> MobileGoogleLogin([FromBody] GoogleLoginRequest request)
{
    // Verify Google ID token
    var googleUser = await VerifyGoogleToken(request.GoogleIdToken);
    
    // Create or get user
    var user = await GetOrCreateUser(googleUser);
    
    // Generate JWT
    var jwtToken = GenerateJwtToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // Return JSON (no redirect needed)
    return Ok(new {
        jwtToken,
        refreshToken,
        username = user.Username,
        email = user.Email
    });
}
```

## 🎯 Recommended Approach

**Short term:** Option 1 (Manual close) + hướng dẫn user

**Medium term:** Option 2 (Refresh button) để improve UX

**Long term:** Yêu cầu backend team implement redirect (xem BACKEND_GOOGLE_LOGIN_FIX.md)

## 📝 User Instructions (Tạm thời)

Thêm vào app hoặc hướng dẫn:

```
Cách đăng nhập bằng Google:
1. Nhấn "Sign in with Google"
2. Đăng nhập tài khoản Google của bạn
3. Sau khi đăng nhập thành công, đóng trình duyệt
4. Quay lại ứng dụng - bạn sẽ được tự động đăng nhập
```

## 🔄 Status

- ✅ Mobile app đã sẵn sàng nhận deep link redirect
- ✅ Auto-login khi nhận được token
- ❌ Backend chưa redirect về app
- ⏳ Đang chờ backend team implement redirect

## 📞 Next Steps

1. Share `BACKEND_GOOGLE_LOGIN_FIX.md` với backend team
2. Implement Option 2 (Refresh button) để cải thiện UX tạm thời
3. Test khi backend đã implement redirect
