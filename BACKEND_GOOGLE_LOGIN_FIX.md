# Backend Fix Required: Google Login Redirect

## 🔴 Vấn đề hiện tại

Backend endpoint `/api/Authen/login/google` đang:
1. Mở trang Google OAuth ✅
2. User đăng nhập thành công ✅
3. **NHƯNG không redirect về app** ❌

Kết quả: Browser dừng lại ở trang callback, không tự động đóng và quay về app.

## ✅ Giải pháp

Backend cần redirect về deep link của app sau khi Google OAuth thành công.

### Option 1: Direct Deep Link Redirect (Recommended)

Sau khi nhận được Google OAuth token và tạo JWT, redirect về:

```
carapp://auth/callback?jwtToken={JWT_TOKEN}&username={USERNAME}&email={EMAIL}&refreshToken={REFRESH_TOKEN}
```

**Backend code example (C# ASP.NET):**

```csharp
[HttpGet("login/google")]
public async Task<IActionResult> GoogleLogin([FromQuery] string redirect_uri)
{
    // ... existing Google OAuth logic ...
    
    // After successful authentication and JWT creation:
    var jwtToken = GenerateJwtToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // Redirect to mobile app deep link
    var callbackUrl = $"carapp://auth/callback?jwtToken={jwtToken}&username={user.Username}&email={user.Email}&refreshToken={refreshToken}";
    
    return Redirect(callbackUrl);
}
```

### Option 2: HTML Page with Auto-Close

Nếu không thể redirect trực tiếp, trả về HTML page:

```csharp
[HttpGet("login/google")]
public async Task<IActionResult> GoogleLogin()
{
    // ... existing Google OAuth logic ...
    
    var jwtToken = GenerateJwtToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    var html = $@"
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Successful</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }}
            .container {{
                text-align: center;
                padding: 2rem;
            }}
            .success-icon {{
                font-size: 4rem;
                margin-bottom: 1rem;
            }}
            h1 {{
                margin: 0 0 1rem 0;
            }}
            p {{
                opacity: 0.9;
            }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='success-icon'>✅</div>
            <h1>Login Successful!</h1>
            <p>Redirecting back to app...</p>
        </div>
        <script>
            // Redirect to app deep link
            const callbackUrl = 'carapp://auth/callback?jwtToken={Uri.EscapeDataString(jwtToken)}&username={Uri.EscapeDataString(user.Username)}&email={Uri.EscapeDataString(user.Email)}&refreshToken={Uri.EscapeDataString(refreshToken)}';
            
            // Try to redirect
            window.location.href = callbackUrl;
            
            // Close window after a short delay (for browsers that support it)
            setTimeout(() => {{
                window.close();
            }}, 1000);
        </script>
    </body>
    </html>
    ";
    
    return Content(html, "text/html");
}
```

### Option 3: Use Query Parameter for Redirect URI

Accept redirect_uri as query parameter:

```csharp
[HttpGet("login/google")]
public async Task<IActionResult> GoogleLogin([FromQuery] string redirect_uri = null)
{{
    // Store redirect_uri in session/state for OAuth callback
    HttpContext.Session.SetString("oauth_redirect_uri", redirect_uri ?? "carapp://auth/callback");
    
    // ... continue with Google OAuth ...
}}

[HttpGet("login/google/callback")]
public async Task<IActionResult> GoogleCallback([FromQuery] string code)
{{
    // ... process Google OAuth callback ...
    
    // Get stored redirect URI
    var redirectUri = HttpContext.Session.GetString("oauth_redirect_uri") ?? "carapp://auth/callback";
    
    // Create JWT and redirect
    var jwtToken = GenerateJwtToken(user);
    var callbackUrl = $"{{redirectUri}}?jwtToken={{jwtToken}}&username={{user.Username}}&email={{user.Email}}";
    
    return Redirect(callbackUrl);
}}
```

## 📱 Mobile App Changes (Already Done)

App đã được update để:
- ✅ Accept redirect_uri parameter: `?redirect_uri=carapp://auth/callback`
- ✅ Listen for deep link callbacks
- ✅ Auto-parse JWT token from callback URL
- ✅ Auto-login user when token is received

## 🧪 Testing

### Test Deep Link Redirect

1. Update backend theo một trong các options trên
2. Deploy backend
3. Test trên mobile app:
   - Click "Sign in with Google"
   - Đăng nhập Google
   - **Browser sẽ tự động đóng và quay về app**
   - User được tự động login

### Test Manually

Simulate deep link:

**iOS Simulator:**
```bash
xcrun simctl openurl booted "carapp://auth/callback?jwtToken=YOUR_JWT_TOKEN&username=testuser&email=test@example.com"
```

**Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "carapp://auth/callback?jwtToken=YOUR_JWT_TOKEN&username=testuser&email=test@example.com" com.carapp.app
```

## 🔍 Debug

Check backend logs for:
- Google OAuth callback received
- JWT token generated
- Redirect URL constructed
- Response sent

Check mobile logs for:
- `🔗 Deep link received:`
- `✅ Google OAuth callback detected`
- `✅ JWT token found in callback`

## ⚠️ Security Notes

1. **HTTPS Only**: Ensure OAuth callback uses HTTPS
2. **Validate State**: Use state parameter to prevent CSRF
3. **Token Expiry**: Set appropriate JWT expiration
4. **Refresh Token**: Include refresh token for long-term sessions
5. **URL Encoding**: Properly encode all query parameters

## 📞 Contact

Nếu cần hỗ trợ implement backend changes, liên hệ mobile team.
