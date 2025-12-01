import React, { useState, useEffect } from "react"
import { View, Text, Pressable, Image } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { useAuth } from "../../../lib/auth-context"
import { useLanguage } from "../../../lib/language-context"

// Components
import Noti from "../Noti/Noti"
import MenuModal from "./components/MenuModal"
import LanguageModal from "./components/LanguageModal"

// Hooks
import { useHeaderAvatar } from "./hooks/useHeaderAvatar"
import { useHeaderNotifications } from "./hooks/useHeaderNotifications"
import { useHeaderNavigation } from "./hooks/useHeaderNavigation"

export default function Header() {
    const { user } = useAuth()
    const { language, setLanguage, version } = useLanguage()

    // State
    const [menuVisible, setMenuVisible] = useState(false)
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [notificationModalVisible, setNotificationModalVisible] = useState(false)

    // Custom hooks
    const { avatarSource, refreshKey, loadUserAvatar } = useHeaderAvatar()
    const { notifications, loadingNotifications, loadNotifications, handleNotificationClick } =
        useHeaderNotifications()
    const { handleLogout, handleMenuNavigation } = useHeaderNavigation()

    // Debug: Log when language changes
    useEffect(() => {
        console.log("Header: Language changed to:", language, "version:", version)
    }, [language, version])

    // Reload data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
                console.log("Header: Screen focused, reloading avatar and notifications")
                loadUserAvatar()
                loadNotifications()
            }
        }, [user?.id])
    )

    const handleMenuNavigationWrapper = (screen: string) => {
        setMenuVisible(false)
        handleMenuNavigation(screen)
    }

    const handleLogoutWrapper = () => {
        setMenuVisible(false)
        handleLogout()
    }

    const handleOpenLanguageModal = () => {
        setMenuVisible(false)
        setLanguageModalVisible(true)
    }

    const handleNotificationClickWrapper = (notification: any) => {
        setNotificationModalVisible(false)
        handleNotificationClick(notification)
    }

    const isStaff = user?.role === "staff" || user?.roleId === 1002

    return (
        <>
            {/* Header Bar */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: scale(20),
                    paddingTop: scale(50),
                    paddingBottom: scale(16),
                    backgroundColor: colors.white,
                }}
            >
                <Pressable onPress={() => handleMenuNavigationWrapper("Home")}>
                    <Text
                        style={{
                            fontSize: scale(28),
                            fontWeight: "700",
                            color: colors.morentBlue,
                            letterSpacing: 1,
                        }}
                    >
                        MORENT
                    </Text>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: scale(16) }}>
                    {/* Notification Icon */}
                    <Pressable
                        onPress={() => {
                            setNotificationModalVisible(true)
                            loadNotifications()
                        }}
                    >
                        <View style={{ position: "relative" }}>
                            <MaterialIcons name="notifications" size={scale(28)} color={colors.primary} />
                            {notifications.filter((n) => !n.isRead).length > 0 && (
                                <View
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        backgroundColor: colors.red,
                                        borderRadius: scale(10),
                                        minWidth: scale(18),
                                        height: scale(18),
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingHorizontal: scale(4),
                                    }}
                                >
                                    <Text style={{ color: colors.white, fontSize: scale(10), fontWeight: "700" }}>
                                        {notifications.filter((n) => !n.isRead).length}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Pressable>

                    {/* Avatar */}
                    <Pressable onPress={() => setMenuVisible(true)}>
                        <View key={`avatar-${refreshKey}`}>
                            <Image
                                source={avatarSource}
                                style={{ width: scale(40), height: scale(40), borderRadius: scale(20) }}
                            />
                        </View>
                    </Pressable>
                </View>
            </View>

            {/* Menu Modal */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onNavigate={handleMenuNavigationWrapper}
                onLogout={handleLogoutWrapper}
                onOpenLanguageModal={handleOpenLanguageModal}
                isStaff={isStaff}
                language={language}
            />

            {/* Language Selection Modal */}
            <LanguageModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
                currentLanguage={language}
                onSelectLanguage={setLanguage}
            />

            {/* Notifications Modal */}
            <Noti
                visible={notificationModalVisible}
                onClose={() => setNotificationModalVisible(false)}
                notifications={notifications}
                loading={loadingNotifications}
                onNotificationClick={handleNotificationClickWrapper}
            />
        </>
    )
}
