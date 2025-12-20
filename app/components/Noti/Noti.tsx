import React from "react"
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import type { Notification } from "../../../lib/api/services/notification.service"

interface NotiProps {
    visible: boolean
    onClose: () => void
    notifications: Notification[]
    loading: boolean
    onNotificationClick: (notification: Notification) => void
}

export default function Noti({
    visible,
    onClose,
    notifications,
    loading,
    onNotificationClick,
}: NotiProps) {

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
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>
                            Notifications
                        </Text>
                        <Pressable onPress={onClose}>
                            <MaterialIcons name="close" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    </View>

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
                                    onPress={() => onNotificationClick(notification)}
                                    style={{
                                        padding: scale(16),
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                        backgroundColor: notification.isRead
                                            ? colors.white
                                            : colors.morentBlue + "10",
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginBottom: scale(4),
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(14),
                                                fontWeight: "600",
                                                color: colors.primary,
                                                flex: 1,
                                            }}
                                        >
                                            {notification.title}
                                        </Text>
                                        {!notification.isRead && (
                                            <View
                                                style={{
                                                    width: scale(8),
                                                    height: scale(8),
                                                    borderRadius: scale(4),
                                                    backgroundColor: colors.morentBlue,
                                                    marginLeft: scale(8),
                                                    marginTop: scale(4),
                                                }}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            color: colors.placeholder,
                                            marginBottom: scale(4),
                                        }}
                                    >
                                        {notification.message}
                                    </Text>
                                    <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                        {new Date(notification.createdAt).toLocaleString()}
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
