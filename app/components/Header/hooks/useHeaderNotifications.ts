import { useState } from "react"
import { useAuth } from "../../../../lib/auth-context"
import { notificationService, type Notification } from "../../../../lib/api/services/notification.service"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"

export function useHeaderNotifications() {
    const { user } = useAuth()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loadingNotifications, setLoadingNotifications] = useState(false)

    const loadNotifications = async () => {
        if (!user?.id) return

        setLoadingNotifications(true)
        try {
            const { data, error } = await notificationService.getNotifications(user.id)
            if (error) {
                console.log("Failed to load notifications (this is normal if no notifications exist)")
                setNotifications([])
                return
            }
            if (data) {
                setNotifications(data)
            } else {
                setNotifications([])
            }
        } catch (err) {
            console.log("Failed to load notifications (this is normal if no notifications exist)")
            setNotifications([])
        } finally {
            setLoadingNotifications(false)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.isRead) {
            await notificationService.markAsRead(notification.id)
        }

        // Navigate based on notification type
        if (notification.type === "booking" && notification.relatedId) {
            navigation.navigate("BookingDetail" as any, { bookingId: notification.relatedId })
        }

        // Reload notifications
        loadNotifications()
    }

    return {
        notifications,
        loadingNotifications,
        loadNotifications,
        handleNotificationClick,
    }
}
