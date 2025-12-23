import React, { useState, useEffect } from "react"
import { View, Text, Pressable, Image, StyleSheet } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { useAuth } from "../../../lib/auth-context"
import { useFavorites } from "../../../lib/favorites-context"

import Noti from "../Noti/Noti"
import MenuModal from "./components/MenuModal"


import { useHeaderAvatar } from "./hooks/useHeaderAvatar"
import { useHeaderNotifications } from "./hooks/useHeaderNotifications"
import { useHeaderNavigation } from "./hooks/useHeaderNavigation"

export default function Header() {
    const { user } = useAuth()
    const { favorites } = useFavorites()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()


    const [menuVisible, setMenuVisible] = useState(false)
    const [notificationModalVisible, setNotificationModalVisible] = useState(false)


    const { avatarSource, refreshKey, loadUserAvatar } = useHeaderAvatar()
    const { notifications, loadingNotifications, loadNotifications, handleNotificationClick } =
        useHeaderNotifications()
    const { handleLogout, handleMenuNavigation } = useHeaderNavigation()





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
            <View style={styles.headerContainer}>
                <Pressable onPress={() => handleMenuNavigationWrapper("Home")}>
                    <Text style={styles.logo}>MORENT</Text>
                </Pressable>

                <View style={styles.rightSection}>
                    {/* Avatar */}
                    <Pressable onPress={() => setMenuVisible(true)}>
                        <View key={`avatar-${refreshKey}`}>
                            <Image source={avatarSource} style={styles.avatar} />
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
                onOpenNotifications={handleOpenNotifications}
                onOpenFavorites={handleOpenFavorites}
                isStaff={isStaff}
                notificationCount={notifications.filter((n) => !n.isViewed).length}
                favoritesCount={favorites.length}
            />



            {/* Notifications Modal */}
            <Noti
                visible={notificationModalVisible}
                onClose={() => setNotificationModalVisible(false)}
                notifications={notifications}
                loading={loadingNotifications}
                onNotificationClick={handleNotificationClickWrapper}
                onNotificationsUpdate={loadNotifications}
            />
        </>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: scale(20),
        paddingTop: scale(50),
        paddingBottom: scale(16),
        backgroundColor: colors.white,
    },
    logo: {
        fontSize: scale(28),
        fontWeight: "700",
        color: colors.morentBlue,
        letterSpacing: 1,
    },
    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(16),
    },
    avatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
    },
})
