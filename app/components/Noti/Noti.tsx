import React from "react"
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator, Alert } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import type { Notification } from "../../../lib/api/services/notification.service"
import { notificationService } from "../../../lib/api/services/notification.service"

interface NotiProps {
    visible: boolean
    onClose: () => void
    notifications: Notification[]
    loading: boolean
    onNotificationClick: (notification: Notification) => void
    onNotificationsUpdate?: () => void // Add callback to refresh notifications
}

export default function Noti({
    visible,
    onClose,
    notifications,
    loading,
    onNotificationClick,
    onNotificationsUpdate,
}: NotiProps) {
    const [markingAsRead, setMarkingAsRead] = React.useState<string | null>(null)
    const [markingAllAsRead, setMarkingAllAsRead] = React.useState(false)

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setMarkingAsRead(notificationId)
            console.log("Marking notification as read:", notificationId)

            const result = await notificationService.markAsRead(notificationId)

            if (result.error) {
                console.error("Failed to mark notification as read:", result.error)
                Alert.alert("Error", "Failed to mark notification as read")
                return
            }

            console.log("Notification marked as read successfully")
            // Refresh notifications to update the UI
            onNotificationsUpdate?.()

        } catch (error) {
            console.error("Error marking notification as read:", error)
            Alert.alert("Error", "Failed to mark notification as read")
        } finally {
            setMarkingAsRead(null)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            setMarkingAllAsRead(true)
            console.log("Marking all notifications as read")

            const unreadNotifications = notifications.filter(n => !n.isViewed)

            if (unreadNotifications.length === 0) {
                Alert.alert("Info", "All notifications are already read")
                return
            }

            // Mark all unread notifications as read
            const promises = unreadNotifications.map(notification =>
                notificationService.markAsRead(notification.id)
            )

            const results = await Promise.all(promises)

            // Check if any failed
            const failures = results.filter(result => result.error)

            if (failures.length > 0) {
                console.error("Some notifications failed to mark as read:", failures)
                Alert.alert("Warning", `${failures.length} notifications failed to mark as read`)
            } else {
                console.log("All notifications marked as read successfully")
            }

            // Refresh notifications to update the UI
            onNotificationsUpdate?.()

        } catch (error) {
            console.error("Error marking all notifications as read:", error)
            Alert.alert("Error", "Failed to mark all notifications as read")
        } finally {
            setMarkingAllAsRead(false)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.isViewed) {
            await handleMarkAsRead(notification.id)
        }

        // Call the original click handler
        onNotificationClick(notification)
    }

    const unreadCount = notifications.filter(n => !n.isViewed).length

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
                onPress={onClose}
            >
                <View
                    style={{
                        position: "absolute",
                        top: scale(90),
                        right: scale(20),
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        width: scale(320),
                        maxHeight: scale(500),
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: scale(16),
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>
                                Notifications
                            </Text>
                            {unreadCount > 0 && (
                                <View
                                    style={{
                                        backgroundColor: colors.morentBlue,
                                        borderRadius: scale(10),
                                        paddingHorizontal: scale(6),
                                        paddingVertical: scale(2),
                                        marginLeft: scale(8),
                                        minWidth: scale(20),
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{
                                        fontSize: scale(12),
                                        fontWeight: "600",
                                        color: colors.white
                                    }}>
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Pressable onPress={onClose}>
                            <MaterialIcons name="close" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    </View>

                    {/* Mark All as Read Button */}
                    {unreadCount > 0 && (
                        <View
                            style={{
                                paddingHorizontal: scale(16),
                                paddingVertical: scale(8),
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                            }}
                        >
                            <Pressable
                                onPress={handleMarkAllAsRead}
                                disabled={markingAllAsRead}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingVertical: scale(8),
                                    paddingHorizontal: scale(12),
                                    backgroundColor: colors.morentBlue,
                                    borderRadius: scale(6),
                                    opacity: markingAllAsRead ? 0.6 : 1,
                                }}
                            >
                                {markingAllAsRead ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <>
                                        <MaterialIcons name="done-all" size={scale(16)} color={colors.white} />
                                        <Text
                                            style={{
                                                marginLeft: scale(6),
                                                fontSize: scale(12),
                                                fontWeight: "600",
                                                color: colors.white,
                                            }}
                                        >
                                            Mark All as Read
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    )}

                    {/* Content */}
                    {loading ? (
                        <View style={{ padding: scale(40), alignItems: "center" }}>
                            <ActivityIndicator size="large" color={colors.morentBlue} />
                        </View>
                    ) : notifications.length === 0 ? (
                        <View style={{ padding: scale(40), alignItems: "center" }}>
                            <MaterialIcons name="notifications-none" size={scale(48)} color={colors.placeholder} />
                            <Text
                                style={{
                                    marginTop: scale(12),
                                    fontSize: scale(14),
                                    color: colors.placeholder,
                                    textAlign: "center",
                                }}
                            >
                                No notifications
                            </Text>
                        </View>
                    ) : (
                        <ScrollView style={{ maxHeight: scale(400) }}>
                            {notifications.map((notification) => (
                                <Pressable
                                    key={notification.id}
                                    onPress={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: scale(16),
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                        backgroundColor: notification.isViewed
                                            ? colors.white
                                            : colors.morentBlue + "10",
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: scale(4),
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(14),
                                                fontWeight: "600",
                                                color: colors.primary,
                                                flex: 1,
                                                marginRight: scale(8),
                                            }}
                                        >
                                            {notification.content}
                                        </Text>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            {!notification.isViewed && (
                                                <>
                                                    <Pressable
                                                        onPress={(e) => {
                                                            e.stopPropagation()
                                                            handleMarkAsRead(notification.id)
                                                        }}
                                                        disabled={markingAsRead === notification.id}
                                                        style={{
                                                            padding: scale(4),
                                                            marginRight: scale(4),
                                                        }}
                                                    >
                                                        {markingAsRead === notification.id ? (
                                                            <ActivityIndicator size="small" color={colors.morentBlue} />
                                                        ) : (
                                                            <MaterialIcons
                                                                name="done"
                                                                size={scale(16)}
                                                                color={colors.morentBlue}
                                                            />
                                                        )}
                                                    </Pressable>
                                                    <View
                                                        style={{
                                                            width: scale(8),
                                                            height: scale(8),
                                                            borderRadius: scale(4),
                                                            backgroundColor: colors.morentBlue,
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                        {new Date(notification.createDate).toLocaleString()}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </Pressable>
        </Modal>
    )
}
