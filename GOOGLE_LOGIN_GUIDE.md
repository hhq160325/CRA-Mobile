# Google Login Implementation Guide

## API Endpoint
```
GET https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/Authen/login/google
```

## Response Format

When user successfully authenticates with Google, the backend returns:

```json
{
  "username": "Quân hồng",
  "email": "quanthanh2205@gmail.com",
  "isGoogle": "True",
  "roleName": null,
  "jwtToken": "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": null
}
```

## JWT Token Structure

The `jwtToken` contains encoded user information:

```json
{
  "aud": "SCRSS",
  "iss": "SCRSS",
  "exp": 1763838790,
  "sub": "c12d0b20-e61d-458f-8ce9-46c45673aad6",
  "name": "Quân hồng",
  "email": "quanthanh2205@gmail.com",
  "IsCarOwner": "False",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "1",
  "iat": 1763836990,
  "nbf": 1763836990
}
```

## Implementation Flow

### 1. User clicks "Sign in with Google"

```typescript
const { loginWithGoogle } = useGoogleLogin()
await loginWithGoogle()
```

### 2. App opens browser with Google OAuth URL

```typescript
const googleLoginUrl = `${API_CONFIG.BASE_URL}/Authen/login/google`
const result = await WebBrowser.openAuthSessionAsync(
  googleLoginUrl,
  "carapp://auth/callback"
)
```

### 3. Backend handles OAuth flow

- User authenticates with Google
- Backend receives Google user info
- Backend creates/finds user in database
- Backend generates JWT token
- Backend redirects back to app with token

### 4. App receives callback with token

The callback URL contains the authentication data:
```
carapp://auth/callback?jwtToken=...&username=...&email=...
```

### 5. App decodes JWT and saves user data

```typescript
// Decode JWT token
const tokenParts = jwtToken.split('.')
const payload = JSON.parse(atob(tokenParts[1]))

// Extract user info
const user = {
  id: payload.sub,
  name: payload.name,
  email: payload.email,
  role: determineRole(payload),
  isGoogle: true
}

// Save to localStorage
localStorage.setItem("token", jwtToken)
localStorage.setItem("user", JSON.stringify(user))
```

### 6. User is logged in

The app navigates to the appropriate screen based on user role.

## Role Determination

Roles are determined from JWT claims:

```typescript
const roleFromToken = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
const isCarOwner = payload.IsCarOwner === "True"

let role: "customer" | "staff" | "car-owner" = "customer"

if (roleFromToken === "1002" || roleFromToken === 1002) {
  role = "staff"
} else if (isCarOwner) {
  role = "car-owner"
} else {
  role = "customer"
}
```

## Role IDs

| Role ID | Role Name | Description |
|---------|-----------|-------------|
| 1 | Customer | Regular user |
| 1002 | Staff | Admin/Staff user |
| - | Car Owner | User who owns cars (IsCarOwner = true) |

## Storage

After successful login, the following data is stored in localStorage:

1. **token**: JWT token for API authentication
2. **refreshToken**: Token for refreshing expired JWT (if provided)
3. **user**: User object with basic info

```typescript
{
  "token": "eyJhbGciOiJodHRwOi8v...",
  "refreshToken": null,
  "user": {
    "id": "c12d0b20-e61d-458f-8ce9-46c45673aad6",
    "name": "Quân hồng",
    "email": "quanthanh2205@gmail.com",
    "role": "customer",
    "isGoogle": true,
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

## Error Handling

### User cancels login:
```typescript
if (result.type === "cancel") {
  return { success: false, error: "Login cancelled" }
}
```

### No token in callback:
```typescript
if (!jwtToken) {
  return { success: false, error: "No authentication token received" }
}
```

### JWT decode error:
```typescript
try {
  const decoded = JSON.parse(atob(payload))
} catch (e) {
  return { success: false, error: "Failed to decode token" }
}
```

## Testing

To test Google login:

1. Click "Sign in with Google" button
2. Browser opens with Google OAuth screen
3. Select Google account
4. Grant permissions
5. Browser redirects back to app
6. Check console logs for:
   - "✅ Authentication successful"
   - "✅ Got JWT token from callback"
   - "✅ Saved user data to localStorage"
   - "✅ User logged in with email: ..."

## Debugging

Enable detailed logging:

```typescript
console.log("=== Starting Google Login ===")
console.log("Opening URL:", googleLoginUrl)
console.log("Browser result:", result)
console.log("Callback URL:", result.url)
console.log("Parsed data:", { hasToken, username, email })
console.log("Decoded JWT:", decodedToken)
console.log("✅ User logged in with email:", user.email)
```

## Security Notes

- JWT tokens are stored in localStorage (secure in React Native)
- Tokens should be validated on every API request
- Implement token refresh mechanism for expired tokens
- Never log full JWT tokens in production
- Use HTTPS for all API calls

## Backend Requirements

The backend must:
1. Handle Google OAuth flow
2. Create/find user in database
3. Generate JWT token with user claims
4. Redirect to app callback URL with token
5. Include user info in JWT payload
