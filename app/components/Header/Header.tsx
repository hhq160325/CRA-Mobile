import React, { useState, useEffect } from "react"
import { View, Text, Pressable, Image } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { useAuth } from "../../../lib/auth-context"
import { useLanguage } from "../../../lib/language-context"
import { useFavorites } from "../../../lib/favorites-context"


import Noti from "../Noti/Noti"
import MenuModal from "./components/MenuModal"
import LanguageModal from "./components/LanguageModal"


import { useHeaderAvatar } from "./hooks/useHeaderAvatar"
import { useHeaderNotifications } from "./hooks/useHeaderNotifications"
import { useHeaderNavigation } from "./hooks/useHeaderNavigation"

export default function Header() {
    const { user } = useAuth()
    const { language, setLanguage, version } = useLanguage()
    const { favorites } = useFavorites()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()


    const [menuVisible, setMenuVisible] = useState(false)
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [notificationModalVisible, setNotificationModalVisible] = useState(false)


    const { avatarSource, refreshKey, loadUserAvatar } = useHeaderAvatar()
    const { notifications, loadingNotifications, loadNotifications, handleNotificationClick } =
        useHeaderNotifications()
    const { handleLogout, handleMenuNavigation } = useHeaderNavigation()


    useEffect(() => {
        console.log("Header: Language changed to:", language, "version:", version)
    }, [language, version])


    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
                console.log("Header: Screen focused, reloading avatar and notifications")
                loadUserAvatar()
                loadNotifications()
            }
        }, [user?.id])
    )

    const handleMenuNavigationWrapper = async (screen: string) => {
        setMenuVisible(false)
        await handleMenuNavigation(screen)
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

    const handleOpenNotifications = () => {
        setMenuVisible(false)
        setNotificationModalVisible(true)
        loadNotifications()
    }

    const handleOpenFavorites = () => {
        setMenuVisible(false)
        navigation.navigate("Cars" as any)
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
                onOpenNotifications={handleOpenNotifications}
                onOpenFavorites={handleOpenFavorites}
                isStaff={isStaff}
                language={language}
                notificationCount={notifications.filter((n) => !n.isRead).length}
                favoritesCount={favorites.length}
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
