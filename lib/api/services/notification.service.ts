import { API_ENDPOINTS, getApiBaseUrl } from "../config"
import { apiClient } from "../client"
import AsyncStorage from '@react-native-async-storage/async-storage'

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token")
    } catch (e) {
        console.error("Failed to get token:", e)
        return null
    }
}

// Authenticated fetch function for notification requests
async function fetchWithAuth<T>(url: string): Promise<{ data: T | null; error: Error | null }> {
    try {
        console.log(" Making authenticated request to:", url)

        // Get authentication token
        const token = await getAuthToken()
        console.log('🔐 Notification: Auth token available:', !!token)

        const headers: Record<string, string> = {
            "accept": "*/*",
            "Content-Type": "application/json",
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(url, {
            method: "GET",
            headers,
        })

        console.log(" Response status:", response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error(" Error response:", errorText)
            return {
                data: null,
                error: new Error(`HTTP ${response.status}: ${errorText}`)
            }
        }

        const data = await response.json()
        console.log(" Success! Received data:", data?.length || 0, "items")
        return { data, error: null }
    } catch (error) {
        console.error(" Fetch error:", error)
        return {
            data: null,
            error: error instanceof Error ? error : new Error("Unknown error")
        }
    }
}

export interface Notification {
    id: string
    userId: string
    content: string
    isViewed: boolean
    createDate: string
}

export const notificationService = {
    async getNotifications(userId: string, userRole?: string): Promise<{ data: Notification[] | null; error: Error | null }> {
        const baseUrl = getApiBaseUrl()

        // Use different endpoints based on user role
        let notificationUrl: string

        if (userRole === 'staff' || userRole === 'admin') {
            // Staff and admin users get all notifications
            notificationUrl = `${baseUrl}/AllNotif`
            console.log(" Staff/Admin user - fetching all notifications")
        } else {
            // Regular users get user-specific notifications
            notificationUrl = `${baseUrl}/UserNotif/${userId}`
            console.log(" Regular user - fetching user-specific notifications")
        }

        console.log(" Base URL:", baseUrl)
        console.log(" User ID:", userId)
        console.log(" User Role:", userRole)
        console.log(" Full notification URL:", notificationUrl)

        // Use authenticated fetch since all APIs now require authentication
        const result = await fetchWithAuth<Notification[]>(notificationUrl)

        if (result.error) {
            // Check if it's a 404 error (no notifications found)
            const errorMessage = result.error.message.toLowerCase()
            const is404 = errorMessage.includes("404") || errorMessage.includes("not found")

            if (is404) {
                // 404 is expected when no notifications exist, return empty array
                console.log(" No notifications found (404), returning empty array")
                return { data: [], error: null }
            }

            console.error(" Notification API error:", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async markAsRead(notificationId: string): Promise<{ data: any | null; error: Error | null }> {
        try {
            console.log("notificationService.markAsRead: marking notification as read", notificationId)

            // Get authentication token
            const token = await getAuthToken()
            console.log('🔐 MarkAsRead: Auth token available:', !!token)

            const headers: Record<string, string> = {
                'accept': '*/*',
                'Content-Type': 'application/json'
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net'
            const url = `${baseUrl}/MarkAsRead/${notificationId}`

            console.log("notificationService.markAsRead: calling URL:", url)

            const response = await fetch(url, {
                method: 'PATCH',
                headers,
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error("notificationService.markAsRead: error response", errorText)
                return { data: null, error: new Error(`HTTP ${response.status}: ${errorText}`) }
            }

            const data = await response.json()
            console.log("notificationService.markAsRead: success", data)
            return { data, error: null }

        } catch (error) {
            console.error("notificationService.markAsRead: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async deleteNotification(notificationId: string): Promise<{ data: any | null; error: Error | null }> {
        // console.log("notificationService.deleteNotification: deleting notification", notificationId)

        const result = await apiClient(API_ENDPOINTS.DELETE_NOTIFICATION(notificationId), {
            method: "DELETE",
        })

        if (result.error) {
            console.error("notificationService.deleteNotification: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },
}
