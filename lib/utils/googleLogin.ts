import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { API_CONFIG, API_ENDPOINTS } from "../api/config"


WebBrowser.maybeCompleteAuthSession()


export const GOOGLE_CONFIG = {

    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",

    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",

    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
}


export const getRedirectUri = () => {
    return makeRedirectUri({
        scheme: 'carapp',
        path: 'auth/callback',
    })
}


console.log("Google OAuth Redirect URI:", getRedirectUri())


export function useGoogleAuth() {
    const redirectUri = getRedirectUri()

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CONFIG.webClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        scopes: ['profile', 'email'],
        redirectUri,
    })

    return { request, response, promptAsync, redirectUri }
}


export async function processGoogleAuthResponse(
    response: any
): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
        if (response?.type === 'success') {
            const { authentication } = response

            if (!authentication?.accessToken) {
                return { success: false, error: "No access token received" }
            }

            console.log("✅ Got Google access token")


            const userInfo = await fetchGoogleUserInfo(authentication.accessToken)

            if (!userInfo) {
                return { success: false, error: "Failed to get user info" }
            }

            console.log("✅ Got Google user info:", userInfo.email)


            const result = await exchangeWithBackend(authentication, userInfo)
            return result

        } else if (response?.type === 'cancel') {
            return { success: false, error: "Login cancelled" }
        } else if (response?.type === 'error') {
            return { success: false, error: response.error?.message || "Authentication error" }
        }

        return { success: false, error: "Authentication failed" }

    } catch (error: any) {
        console.error("❌ Process auth response error:", error)
        return { success: false, error: error.message }
    }
}


async function fetchGoogleUserInfo(accessToken: string): Promise<any | null> {
    try {
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
            console.error("Failed to fetch Google user info:", response.status)
            return null
        }

        const userInfo = await response.json()
        return userInfo

    } catch (error) {
        console.error("Error fetching Google user info:", error)
        return null
    }
}


async function exchangeWithBackend(
    authentication: { accessToken: string; idToken?: string | null },
    googleUser: { id: string; email: string; name: string; picture?: string }
): Promise<{ success: boolean; error?: string; user?: any }> {
    try {

        const token = authentication.idToken || authentication.accessToken

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        })

        console.log("Backend response status:", response.status)

        if (response.ok) {
            const data = await response.json()
            console.log("Backend response:", data)

            const jwtToken = data.jwtToken || data.token
            if (jwtToken) {
                const user = processBackendResponse(jwtToken, data, googleUser)
                return { success: true, user }
            }
        }


        console.log("Using Google user data directly")
        return createUserFromGoogle(googleUser, authentication.accessToken)

    } catch (error: any) {
        console.error("Backend exchange error:", error)

        return createUserFromGoogle(googleUser, authentication.accessToken)
    }
}


function processBackendResponse(
    jwtToken: string,
    backendData: any,
    googleUser: { id: string; email: string; name: string; picture?: string }
): any {
    let decodedToken: any = {}

    try {
        const tokenParts = jwtToken.split('.')
        if (tokenParts.length === 3) {
            const payload = tokenParts[1]
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            decodedToken = JSON.parse(jsonPayload)
        }
    } catch (e) {
        console.error("Failed to decode JWT:", e)
    }


    let role: "customer" | "staff" | "car-owner" = "customer"
    const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

    if (roleFromToken === "1002" || decodedToken.roleId === 1002) {
        role = "staff"
    } else if (decodedToken.IsCarOwner === "True") {
        role = "car-owner"
    }

    const user = {
        id: decodedToken.sub || backendData.userId || googleUser.id,
        name: backendData.username || decodedToken.name || googleUser.name,
        email: backendData.email || decodedToken.email || googleUser.email,
        avatar: googleUser.picture,
        role,
        roleId: parseInt(roleFromToken) || 1,
        createdAt: new Date().toISOString(),
        isGoogle: true,
    }

    saveAuthData(jwtToken, user, backendData.refreshToken)
    return user
}


function createUserFromGoogle(
    googleUser: { id: string; email: string; name: string; picture?: string },
    accessToken: string
): { success: boolean; user: any } {
    const user = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        role: "customer" as const,
        roleId: 1,
        createdAt: new Date().toISOString(),
        isGoogle: true,
    }

    saveAuthData(accessToken, user)
    console.log("✅ User created from Google:", user.email)
    return { success: true, user }
}


function saveAuthData(token: string, user: any, refreshToken?: string) {
    try {
        if (typeof localStorage !== "undefined" && localStorage?.setItem) {
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken)
            }
            console.log("✅ Auth data saved")
        }
    } catch (e) {
        console.error("Failed to save auth data:", e)
    }
}


export async function performGoogleLogin(): Promise<{ success: boolean; error?: string; user?: any }> {

    return {
        success: false,
        error: "Use useGoogleAuth hook with promptAsync instead"
    }
}
