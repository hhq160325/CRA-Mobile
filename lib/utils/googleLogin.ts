import * as WebBrowser from "expo-web-browser"
import { API_CONFIG, API_ENDPOINTS } from "../api/config"

WebBrowser.maybeCompleteAuthSession()


let pollingInterval: NodeJS.Timeout | null = null

function startTokenPolling(onTokenFound: (user: any) => void): void {
    console.log("🔄 Starting token polling...")

    pollingInterval = setInterval(() => {
        try {
            if (typeof localStorage !== "undefined" && localStorage?.getItem) {
                const token = localStorage.getItem("token")
                const userStr = localStorage.getItem("user")

                if (token && userStr) {
                    console.log("✅ Token found via polling!")
                    stopTokenPolling()

                    const user = JSON.parse(userStr)
                    onTokenFound(user)
                }
            }
        } catch (e) {
            console.error("Polling error:", e)
        }
    }, 1000)
}

function stopTokenPolling(): void {
    if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        console.log("⏹️ Stopped token polling")
    }
}

export async function performGoogleLogin(): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
        console.log("=== Starting Google Login ===")


        const googleLoginUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`
        console.log("Opening URL:", googleLoginUrl)


        let tokenFoundViaPolling = false
        let pollingUser: any = null

        startTokenPolling((user) => {
            tokenFoundViaPolling = true
            pollingUser = user
            console.log("✅ Token detected via polling, dismissing browser...")
            WebBrowser.dismissBrowser()
        })


        const result = await WebBrowser.openAuthSessionAsync(
            googleLoginUrl,
            "carapp://auth/callback"
        )


        stopTokenPolling()

        console.log("Browser result type:", result.type)
        console.log("Browser result:", JSON.stringify(result, null, 2))


        if (tokenFoundViaPolling && pollingUser) {
            console.log("✅ Login successful via polling")
            return { success: true, user: pollingUser }
        }

        if (result.type === "success" && result.url) {
            console.log("✅ Authentication successful")
            console.log("Callback URL:", result.url)
            console.log("Full result object:", result)


            const url = new URL(result.url)
            const params = url.searchParams


            let jwtToken = params.get("jwtToken") || params.get("token")
            let username = params.get("username")
            let email = params.get("email")
            let refreshToken = params.get("refreshToken")


            if (!jwtToken && url.hash) {
                const hashParams = new URLSearchParams(url.hash.substring(1))
                jwtToken = hashParams.get("jwtToken") || hashParams.get("token")
                username = hashParams.get("username")
                email = hashParams.get("email")
                refreshToken = hashParams.get("refreshToken")
            }

            console.log("Parsed data:", {
                hasToken: !!jwtToken,
                username,
                email,
                refreshToken,
            })

            if (jwtToken) {
                console.log("✅ Got JWT token from callback")


                const tokenParts = jwtToken.split('.')
                let decodedToken: any = {}

                if (tokenParts.length === 3) {
                    try {
                        const payload = tokenParts[1]
                        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
                        const jsonPayload = decodeURIComponent(
                            atob(base64)
                                .split('')
                                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                                .join('')
                        )
                        decodedToken = JSON.parse(jsonPayload)
                        console.log("Decoded JWT:", decodedToken)
                    } catch (e) {
                        console.error("Failed to decode JWT:", e)
                    }
                }


                let role: "customer" | "staff" | "car-owner" = "customer"
                const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                const roleId = decodedToken.roleId || decodedToken.RoleId

                if (roleId === 1002 || roleId === "1002") {
                    role = "staff"
                } else if (roleFromToken === "2" || roleFromToken === 2) {
                    role = "staff"
                } else if (decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true) {
                    role = "car-owner"
                }


                try {
                    if (typeof localStorage !== "undefined" && localStorage?.setItem) {
                        localStorage.setItem("token", jwtToken)

                        if (refreshToken && refreshToken !== "null") {
                            localStorage.setItem("refreshToken", refreshToken)
                        }


                        const user = {
                            id: decodedToken.sub || "",
                            name: username || decodedToken.name || "",
                            email: email || decodedToken.email || "",
                            role: role,
                            roleId: parseInt(roleFromToken) || 1,
                            createdAt: new Date().toISOString(),
                            isGoogle: true,
                        }

                        localStorage.setItem("user", JSON.stringify(user))
                        console.log("✅ Saved user data to localStorage:", user)
                        console.log("✅ User logged in with email:", user.email)
                        console.log("✅ User role:", user.role)

                        return { success: true, user }
                    }
                } catch (e) {
                    console.error("Failed to save to localStorage:", e)

                    const user = {
                        id: decodedToken.sub || "",
                        name: username || decodedToken.name || "",
                        email: email || decodedToken.email || "",
                        role: role,
                        roleId: parseInt(roleFromToken) || 1,
                        createdAt: new Date().toISOString(),
                        isGoogle: true,
                    }
                    return { success: true, user }
                }


                const user = {
                    id: decodedToken.sub || "",
                    name: username || decodedToken.name || "",
                    email: email || decodedToken.email || "",
                    role: role,
                    roleId: parseInt(roleFromToken) || 1,
                    createdAt: new Date().toISOString(),
                    isGoogle: true,
                }
                return { success: true, user }
            } else {
                console.error("❌ No JWT token in callback URL")
                console.log("Full URL:", result.url)
                return { success: false, error: "No authentication token received" }
            }

        } else if (result.type === "cancel") {
            console.log("⚠️ User cancelled Google login")
            return { success: false, error: "Login cancelled" }
        } else if (result.type === "dismiss") {
            console.log("⚠️ Browser dismissed")


            if (tokenFoundViaPolling && pollingUser) {
                console.log("✅ Login successful (dismissed after token found)")
                return { success: true, user: pollingUser }
            }


            try {
                if (typeof localStorage !== "undefined" && localStorage?.getItem) {
                    const token = localStorage.getItem("token")
                    const userStr = localStorage.getItem("user")

                    if (token && userStr) {
                        console.log("✅ Found token in localStorage after dismiss")
                        const user = JSON.parse(userStr)
                        return { success: true, user }
                    }
                }
            } catch (e) {
                console.error("Error checking localStorage:", e)
            }

            return { success: false, error: "Login cancelled or incomplete" }
        } else {
            console.log("❌ Authentication failed:", result.type)
            return { success: false, error: "Authentication failed" }
        }
    } catch (error: any) {
        console.error("❌ Google login error:", error)
        return {
            success: false,
            error: error.message || "An error occurred during Google login",
        }
    }
}
