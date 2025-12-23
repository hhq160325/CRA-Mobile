import React from "react"
import { View, Text, Pressable, Modal, StyleSheet } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

interface MenuModalProps {
    visible: boolean
    onClose: () => void
    onNavigate: (screen: string) => void
    onLogout: () => void
    onOpenNotifications: () => void
    onOpenFavorites: () => void
    isStaff: boolean
    notificationCount: number
    favoritesCount: number
}

export default function MenuModal({
    visible,
    onClose,
    onNavigate,
    onLogout,
    onOpenNotifications,
    onOpenFavorites,
    isStaff,
    notificationCount,
    favoritesCount,
}: MenuModalProps) {

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.menuContainer}>
                    <Pressable onPress={() => onNavigate("Home")} style={styles.menuItem}>
                        <MaterialIcons name="home" size={scale(20)} color={colors.primary} />
                        <Text style={styles.menuText}>Home</Text>
                    </Pressable>

                    <Pressable onPress={onOpenNotifications} style={styles.menuItem}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="notifications" size={scale(20)} color={colors.primary} />
                            {notificationCount > 0 && (
                                <View style={[styles.badge, styles.notificationBadge]}>
                                    <Text style={styles.badgeText}>{notificationCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                    </Pressable>

                    {!isStaff && (
                        <Pressable onPress={onOpenFavorites} style={styles.menuItem}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="favorite" size={scale(20)} color={colors.primary} />
                                {favoritesCount > 0 && (
                                    <View style={[styles.badge, styles.favoritesBadge]}>
                                        <Text style={styles.badgeText}>{favoritesCount}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.menuText}>Favorites</Text>
                        </Pressable>
                    )}

                    <Pressable onPress={() => onNavigate("Profile")} style={styles.menuItem}>
                        <MaterialIcons name="person" size={scale(20)} color={colors.primary} />
                        <Text style={styles.menuText}>Profile</Text>
                    </Pressable>

                    {!isStaff && (
                        <>
                            <Pressable onPress={() => onNavigate("Bookings")} style={styles.menuItem}>
                                <MaterialIcons name="event-note" size={scale(20)} color={colors.primary} />
                                <Text style={styles.menuText}>Bookings</Text>
                            </Pressable>

                            <Pressable onPress={() => onNavigate("PaymentHistory")} style={styles.menuItem}>
                                <MaterialIcons name="payment" size={scale(20)} color={colors.primary} />
                                <Text style={styles.menuText}>Payment History</Text>
                            </Pressable>
                        </>
                    )}

                    <View style={styles.divider} />

                    <Pressable onPress={onLogout} style={styles.menuItem}>
                        <MaterialIcons name="logout" size={scale(20)} color="#EF4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    menuContainer: {
        position: "absolute",
        top: scale(90),
        right: scale(20),
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: scale(8),
        minWidth: scale(180),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: scale(12),
        paddingHorizontal: scale(12),
        borderRadius: 8,
    },
    menuText: {
        marginLeft: scale(12),
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: "500",
    },
    iconContainer: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        borderRadius: scale(8),
        minWidth: scale(14),
        height: scale(14),
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: scale(3),
    },
    notificationBadge: {
        backgroundColor: colors.red,
    },
    favoritesBadge: {
        backgroundColor: colors.morentBlue,
    },
    badgeText: {
        color: colors.white,
        fontSize: scale(8),
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: scale(4),
    },

    logoutText: {
        marginLeft: scale(12),
        fontSize: scale(14),
        color: "#EF4444",
        fontWeight: "500",
    },
})
