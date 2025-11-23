import React, { useState, useEffect } from "react"
import { View, Text, Pressable, Image, Modal } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { useAuth } from "../../../lib/auth-context"
import { useLanguage } from "../../../lib/language-context"
import { userService } from "../../../lib/api/services/user.service"
import getAsset from "@/lib/getAsset"

export default function Header() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [menuVisible, setMenuVisible] = useState(false)
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const { user, logout } = useAuth()
    const { language, setLanguage, t } = useLanguage()


    const loadUserAvatar = async () => {
        if (!user?.id) return

        console.log("Header: Loading user avatar for user", user.id)
        try {
            const { data, error } = await userService.getUserById(user.id)
            if (error) {

                const isNotFound = (error as any).status === 404 ||
                    error.message?.includes("404") ||
                    error.message?.toLowerCase().includes("not found")

                if (isNotFound) {
                    console.log("Header: User account not found (404), logging out")
                    logout()
                    navigation.navigate("authStack" as any)
                    return
                }
                console.log("Header: Failed to load user data, using default avatar")
                setUserAvatar(null)
                return
            }
            if (data && data.imageAvatar) {
                console.log("Header: Avatar loaded:", data.imageAvatar)
                setUserAvatar(data.imageAvatar)
                setRefreshKey(Date.now())
            } else {
                console.log("Header: No avatar found in user data")
            }
        } catch (err) {
            console.error("Failed to load user avatar:", err)
            setUserAvatar(null)
        }
    }


    useEffect(() => {
        if (user?.id) {
            loadUserAvatar()
        }
    }, [user?.id])


    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
                loadUserAvatar()
            }
        }, [user?.id])
    )


    const avatarSource = userAvatar
        ? { uri: `${userAvatar}?t=${refreshKey}` }
        : user?.avatar
            ? (user.avatar.startsWith('http') ? { uri: user.avatar } : getAsset(user.avatar))
            : require("../../../assets/admin-avatar.png")

    const handleLogout = () => {
        setMenuVisible(false)
        logout()
        navigation.navigate("authStack" as any)
    }

    const handleMenuNavigation = (screen: string) => {
        setMenuVisible(false)
        try {
            if (screen === "Profile") {
                navigation.navigate("Profile" as any)
            } else if (screen === "Bookings") {
                // Navigate to Bookings screen in main tab stack
                navigation.navigate("Bookings" as any)
            } else if (screen === "Cars") {
                navigation.navigate("Cars" as any)
            } else if (screen === "Home") {
                navigation.navigate("Home" as any)
            }
        } catch (error) {
            console.error("Navigation error:", error)
            // Fallback: reset to tab stack
            navigation.reset({
                index: 0,
                routes: [{ name: "tabStack" as any }],
            })
        }
    }

    return (
        <>
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
                <Pressable onPress={() => navigation.navigate("Home" as any)}>
                    <Text style={{ fontSize: scale(28), fontWeight: "700", color: colors.morentBlue, letterSpacing: 1 }}>
                        MORENT
                    </Text>
                </Pressable>
                <Pressable onPress={() => setMenuVisible(true)}>
                    <Image
                        key={`avatar-${refreshKey}`}
                        source={avatarSource}
                        style={{ width: scale(40), height: scale(40), borderRadius: scale(20) }}
                    />
                </Pressable>
            </View>

            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                    onPress={() => setMenuVisible(false)}
                >
                    <View
                        style={{
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
                        }}
                    >
                        <Pressable
                            onPress={() => handleMenuNavigation("Home")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="home" size={scale(20)} color={colors.primary} />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                                {t("home")}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleMenuNavigation("Profile")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="person" size={scale(20)} color={colors.primary} />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                                {t("profile")}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleMenuNavigation("Bookings")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="event-note" size={scale(20)} color={colors.primary} />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                                {t("bookings")}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleMenuNavigation("Cars")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="directions-car" size={scale(20)} color={colors.primary} />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                                {t("cars")}
                            </Text>
                        </Pressable>

                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: scale(4) }} />

                        <Pressable
                            onPress={() => {
                                setMenuVisible(false)
                                setLanguageModalVisible(true)
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="language" size={scale(20)} color={colors.primary} />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                                {t("language")}
                            </Text>
                            <Text style={{ marginLeft: scale(8), fontSize: scale(12), color: colors.placeholder }}>
                                ({language === "en" ? "EN" : "VI"})
                            </Text>
                        </Pressable>

                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: scale(4) }} />

                        <Pressable
                            onPress={handleLogout}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name="logout" size={scale(20)} color="#EF4444" />
                            <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: "#EF4444", fontWeight: "500" }}>
                                {t("logout")}
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Language Selection Modal */}
            <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 16,
                            padding: scale(20),
                            width: "80%",
                            maxWidth: scale(300),
                        }}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary, marginBottom: scale(16) }}>
                            {t("language")}
                        </Text>

                        <Pressable
                            onPress={() => {
                                setLanguage("en")
                                setLanguageModalVisible(false)
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: scale(14),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                                backgroundColor: language === "en" ? colors.morentBlue + "20" : colors.background,
                                marginBottom: scale(8),
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ fontSize: scale(24), marginRight: scale(12) }}>🇬🇧</Text>
                                <Text style={{ fontSize: scale(16), color: colors.primary, fontWeight: language === "en" ? "600" : "400" }}>
                                    English
                                </Text>
                            </View>
                            {language === "en" && (
                                <MaterialIcons name="check-circle" size={scale(20)} color={colors.morentBlue} />
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setLanguage("vi")
                                setLanguageModalVisible(false)
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: scale(14),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                                backgroundColor: language === "vi" ? colors.morentBlue + "20" : colors.background,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ fontSize: scale(24), marginRight: scale(12) }}>🇻🇳</Text>
                                <Text style={{ fontSize: scale(16), color: colors.primary, fontWeight: language === "vi" ? "600" : "400" }}>
                                    Tiếng Việt
                                </Text>
                            </View>
                            {language === "vi" && (
                                <MaterialIcons name="check-circle" size={scale(20)} color={colors.morentBlue} />
                            )}
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}
