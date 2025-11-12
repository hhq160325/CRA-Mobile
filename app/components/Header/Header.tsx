import React, { useState } from "react"
import { View, Text, Pressable, Image, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { useAuth } from "../../../lib/auth-context"

export default function Header() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [menuVisible, setMenuVisible] = useState(false)
    const { logout } = useAuth()

    const handleLogout = async () => {
        setMenuVisible(false)
        await logout()
        navigation.navigate("authStack" as any)
    }

    const handleMenuNavigation = (screen: string) => {
        setMenuVisible(false)
        if (screen === "Profile") {
            navigation.navigate("Profile" as any)
        } else if (screen === "Bookings") {
            navigation.navigate("Bookings" as any)
        } else if (screen === "Cars") {
            navigation.navigate("Cars" as any)
        } else if (screen === "Home") {
            navigation.navigate("Home" as any)
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
                        source={require("../../../assets/admin-avatar.png")}
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
                                Home
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
                                Profile
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
                                Bookings
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
                                Cars
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
                                Logout
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}
