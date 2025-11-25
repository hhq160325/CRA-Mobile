import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface Notification {
    id: string
    userId: string
    title: string
    message: string
    type: string
    relatedId?: string
    isRead: boolean
    createdAt: string
}

export const notificationService = {
    async getNotifications(userId: string): Promise<{ data: Notification[] | null; error: Error | null }> {
        console.log("notificationService.getNotifications: fetching notifications for user", userId)

        const result = await apiClient<Notification[]>(API_ENDPOINTS.GET_NOTIFICATIONS(userId), {
            method: "GET",
        })

        console.log("notificationService.getNotifications: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            count: result.data?.length || 0,
        })

        if (result.error) {
            console.error("notificationService.getNotifications: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async markAsRead(notificationId: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("notificationService.markAsRead: marking notification as read", notificationId)

        const result = await apiClient(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
            method: "PATCH",
        })

        if (result.error) {
            console.error("notificationService.markAsRead: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async deleteNotification(notificationId: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("notificationService.deleteNotification: deleting notification", notificationId)

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
