# Google Login Fix - Hook Error Resolution

## Problem

```
ERROR auth-context: Google login exception 
[Error: Invalid hook call. Hooks can only be called inside of the body of a function component.]
```

## Root Cause

The auth context was trying to call `useGoogleLogin()` hook inside the `loginWithGoogle` function. Hooks can only be called at the top level of React components, not inside regular functions or other hooks.

## Solution

Created a separate helper function `performGoogleLogin()` that doesn't use React hooks, so it can be called from anywhere.

### File Structure

```
lib/
├── utils/
│   └── googleLogin.ts          ✅ NEW - Helper function (no hooks)
├── hooks/
│   └── useGoogleLogin.ts       ✅ UPDATED - Now uses helper function
└── auth-context.tsx            ✅ UPDATED - Calls helper function
```

## Implementation

### 1. Created Helper Function (lib/utils/googleLogin.ts)

```typescript
export async function performGoogleLogin(): Promise<{ 
  success: boolean; 
  error?: string; 
  user?: any 
}> {
  // Open browser for Google OAuth
  const result = await WebBrowser.openAuthSessionAsync(
    googleLoginUrl,
    "carapp://auth/callback"
  )
  
  // Parse callback URL
  // Decode JWT token
  // Save to localStorage
  // Return result
}
```

**Key Points:**
- ✅ Not a hook - can be called anywhere
- ✅ No `useState` or other React hooks
- ✅ Pure async function
- ✅ Returns success/error result

### 2. Updated Hook (lib/hooks/useGoogleLogin.ts)

```typescript
export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      const result = await performGoogleLogin()  // ✅ Calls helper
      return result
    } finally {
      setIsLoading(false)
    }
  }

  return { loginWithGoogle, isLoading }
}
```

**Key Points:**
- ✅ Still a hook (for components that need loading state)
- ✅ Delegates actual login to helper function
- ✅ Manages loading state only

### 3. Updated Auth Context (lib/auth-context.tsx)

```typescript
const loginWithGoogle = async (): Promise<boolean> => {
  try {
    // Import helper function (not a hook!)
    const { performGoogleLogin } = require("./utils/googleLogin")
    
    const result = await performGoogleLogin()
    
    if (result.success) {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        return true
      }
    }
    
    return false
  } catch (err) {
    console.error('auth-context: Google login exception', err)
    return false
  }
}
```

**Key Points:**
- ✅ Calls helper function, not hook
- ✅ No "Invalid hook call" error
- ✅ Updates user state after successful login

## Why This Works

### ❌ Before (WRONG):
```typescript
// In auth-context.tsx
const loginWithGoogle = async () => {
  const { useGoogleLogin } = require("./hooks/useGoogleLogin")
  const { loginWithGoogle: googleLoginFn } = useGoogleLogin()  // ❌ Hook call!
  // ...
}
```

**Problem:** Calling a hook inside a regular function

### ✅ After (CORRECT):
```typescript
// In auth-context.tsx
const loginWithGoogle = async () => {
  const { performGoogleLogin } = require("./utils/googleLogin")
  const result = await performGoogleLogin()  // ✅ Regular function call
  // ...
}
```

**Solution:** Calling a regular async function

## Usage

### In Components (with loading state):
```typescript
const { loginWithGoogle, isLoading } = useGoogleLogin()

const handleLogin = async () => {
  const result = await loginWithGoogle()
  if (result.success) {
    // Handle success
  }
}
```

### In Auth Context (without loading state):
```typescript
const loginWithGoogle = async () => {
  const result = await performGoogleLogin()
  if (result.success) {
    setUser(authService.getCurrentUser())
    return true
  }
  return false
}
```

### Direct Call (anywhere):
```typescript
import { performGoogleLogin } from "./utils/googleLogin"

const result = await performGoogleLogin()
```

## Benefits

✅ **No hook errors** - Helper function can be called anywhere
✅ **Reusable** - Can be used in components, contexts, or services
✅ **Clean separation** - Logic separated from React hooks
✅ **Flexible** - Components can still use hook for loading state
✅ **Type-safe** - Proper TypeScript types

## Testing

After this fix, Google login should work without errors:

```
LOG === Starting Google Sign-In ===
LOG auth-context: Google login initiated
LOG === Starting Google Login ===
LOG Opening URL: https://...
LOG ✅ Authentication successful
LOG ✅ Got JWT token from callback
LOG ✅ Saved user data to localStorage
LOG auth-context: Google login successful
LOG ✅ Google login successful, setting justLoggedIn flag
LOG === User logged in, navigating based on role ===
LOG ✅ Navigating to tabStack
```

No more "Invalid hook call" errors! ✅
