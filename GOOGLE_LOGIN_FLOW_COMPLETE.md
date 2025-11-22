# Google Login Flow - Complete Implementation

## Overview

After user selects Google account, the app automatically:
1. Gets JWT token from backend
2. Decodes token to extract user info
3. Saves token and user data to localStorage
4. Updates auth context
5. Navigates to Home screen (or Staff screen based on role)

## Implementation

### 1. Auth Context (lib/auth-context.tsx)

Added `loginWithGoogle` method to auth context:

```typescript
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>  // ✅ NEW
  logout: () => void
  isAuthenticated: boolean
  refreshUser: () => void  // ✅ NEW
}
```

### 2. Login Flow

```typescript
const loginWithGoogle = async (): Promise<boolean> => {
  // 1. Call Google login hook
  const result = await googleLoginFn()
  
  // 2. If successful, get user from localStorage
  if (result.success) {
    const currentUser = authService.getCurrentUser()
    
    // 3. Update auth context state
    if (currentUser) {
      setUser(currentUser)
      return true
    }
  }
  
  return false
}
```

### 3. Sign In Screen (app/screens/singin/signin.screen.tsx)

```typescript
const handleGoogleLogin = async () => {
  setIsLoading(true)
  try {
    // Call loginWithGoogle from auth context
    const success = await loginWithGoogle()

    if (success) {
      // Set flag to trigger navigation
      setJustLoggedIn(true)
    } else {
      Alert.alert("Google Sign-In Failed", "Unable to sign in with Google")
    }
  } catch (err) {
    Alert.alert("Google Sign-In Error", err?.message || "Something went wrong")
  } finally {
    setIsLoading(false)
  }
}
```

### 4. Auto Navigation

When user state updates, useEffect automatically navigates:

```typescript
useEffect(() => {
  if (justLoggedIn && user) {
    const { navigationRef } = require("../../navigators/navigation-utilities")
    
    if (navigationRef && navigationRef.isReady()) {
      if (user.role === "staff") {
        // Navigate to Staff screen
        navigationRef.reset({
          index: 0,
          routes: [{ name: "StaffScreen" }],
        })
      } else {
        // Navigate to Home screen (tabStack)
        navigationRef.reset({
          index: 0,
          routes: [{ name: "tabStack" }],
        })
      }
    }
  }
}, [justLoggedIn, user])
```

## Complete Flow Diagram

```
User clicks "Sign in with Google"
         ↓
Opens browser with Google OAuth
         ↓
User selects Google account
         ↓
Backend receives Google auth
         ↓
Backend creates/finds user
         ↓
Backend generates JWT token
         ↓
Backend redirects to app with token
         ↓
App receives callback URL
         ↓
useGoogleLogin hook parses token
         ↓
Saves token + user to localStorage
         ↓
loginWithGoogle updates auth context
         ↓
user state changes
         ↓
useEffect detects user change
         ↓
Navigates to Home/Staff screen
         ↓
✅ User is logged in!
```

## Navigation Logic

### For Regular Users (Customer/Car Owner):
```typescript
navigationRef.reset({
  index: 0,
  routes: [{ name: "tabStack" }],  // Goes to Home screen
})
```

### For Staff:
```typescript
navigationRef.reset({
  index: 0,
  routes: [{ name: "StaffScreen" }],  // Goes to Staff dashboard
})
```

## Role Detection

Roles are determined from JWT token:

```typescript
const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
const isCarOwner = decodedToken.IsCarOwner === "True"

if (roleFromToken === "1002") {
  role = "staff"
} else if (isCarOwner) {
  role = "car-owner"
} else {
  role = "customer"
}
```

## Data Stored in localStorage

After successful Google login:

```json
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

## Testing

### Success Flow:
1. Click "Sign in with Google" button
2. Browser opens
3. Select Google account
4. Grant permissions
5. Browser closes
6. Console shows:
   ```
   === Starting Google Sign-In ===
   auth-context: Google login initiated
   ✅ Authentication successful
   ✅ Got JWT token from callback
   ✅ Saved user data to localStorage
   auth-context: Google login successful
   ✅ Google login successful, setting justLoggedIn flag
   === User logged in, navigating based on role ===
   ✅ Navigating to tabStack
   ```
7. App navigates to Home screen
8. ✅ User is logged in!

### Error Handling:

**User cancels:**
```
⚠️ User cancelled Google login
Alert: "Google Sign-In Failed"
```

**No token received:**
```
❌ No JWT token in callback URL
Alert: "Google Sign-In Failed"
```

**Network error:**
```
❌ Google login error: [error message]
Alert: "Google Sign-In Error"
```

## Key Features

✅ **Automatic navigation** - No manual navigation needed
✅ **Role-based routing** - Staff goes to StaffScreen, others to Home
✅ **State management** - Auth context keeps user state in sync
✅ **Error handling** - Clear error messages for all failure cases
✅ **Loading states** - Shows loading indicator during login
✅ **Token persistence** - Tokens saved to localStorage
✅ **JWT decoding** - Extracts user info from token

## Security

- JWT tokens stored securely in localStorage
- Tokens validated on every API request
- User role determined from JWT claims
- No sensitive data logged in production

## Notes

- `navigationRef.reset()` clears navigation stack
- `justLoggedIn` flag prevents multiple navigations
- Small delay ensures tokens are saved before navigation
- Works with both iOS and Android
