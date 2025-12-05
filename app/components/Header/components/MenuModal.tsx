import React from "react"
import { View, Text, Pressable, Modal } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { useLanguage } from "../../../../lib/language-context"

interface MenuModalProps {
    visible: boolean
    onClose: () => void
    onNavigate: (screen: string) => void
    onLogout: () => void
    onOpenLanguageModal: () => void
    onOpenNotifications: () => void
    onOpenFavorites: () => void
    isStaff: boolean
    language: string
    notificationCount: number
    favoritesCount: number
}

export default function MenuModal({
    visible,
    onClose,
    onNavigate,
    onLogout,
    onOpenLanguageModal,
    onOpenNotifications,
    onOpenFavorites,
    isStaff,
    language,
    notificationCount,
    favoritesCount,
}: MenuModalProps) {
    const { t } = useLanguage()

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
                        onPress={() => onNavigate("Home")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: scale(12),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                        }}
                    >
                        <MaterialIcons name="home" size={scale(20)} color={colors.primary} />
                        <Text
                            style={{
                                marginLeft: scale(12),
                                fontSize: scale(14),
                                color: colors.primary,
                                fontWeight: "500",
                            }}
                        >
                            {t("home")}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onOpenNotifications}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: scale(12),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                        }}
                    >
                        <View style={{ position: "relative" }}>
                            <MaterialIcons name="notifications" size={scale(20)} color={colors.primary} />
                            {notificationCount > 0 && (
                                <View
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        backgroundColor: colors.red,
                                        borderRadius: scale(8),
                                        minWidth: scale(14),
                                        height: scale(14),
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingHorizontal: scale(3),
                                    }}
                                >
                                    <Text style={{ color: colors.white, fontSize: scale(8), fontWeight: "700" }}>
                                        {notificationCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text
                            style={{
                                marginLeft: scale(12),
                                fontSize: scale(14),
                                color: colors.primary,
                                fontWeight: "500",
                            }}
                        >
                            {t("notifications")}
                        </Text>
                    </Pressable>

                    {!isStaff && (
                        <Pressable
                            onPress={onOpenFavorites}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: scale(12),
                                paddingHorizontal: scale(12),
                                borderRadius: 8,
                            }}
                        >
                            <View style={{ position: "relative" }}>
                                <MaterialIcons name="favorite" size={scale(20)} color={colors.primary} />
                                {favoritesCount > 0 && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            top: -4,
                                            right: -4,
                                            backgroundColor: colors.morentBlue,
                                            borderRadius: scale(8),
                                            minWidth: scale(14),
                                            height: scale(14),
                                            justifyContent: "center",
                                            alignItems: "center",
                                            paddingHorizontal: scale(3),
                                        }}
                                    >
                                        <Text style={{ color: colors.white, fontSize: scale(8), fontWeight: "700" }}>
                                            {favoritesCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                style={{
                                    marginLeft: scale(12),
                                    fontSize: scale(14),
                                    color: colors.primary,
                                    fontWeight: "500",
                                }}
                            >
                                {t("favorites") || "Favorites"}
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={() => onNavigate("Profile")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: scale(12),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                        }}
                    >
                        <MaterialIcons name="person" size={scale(20)} color={colors.primary} />
                        <Text
                            style={{
                                marginLeft: scale(12),
                                fontSize: scale(14),
                                color: colors.primary,
                                fontWeight: "500",
                            }}
                        >
                            {t("profile")}
                        </Text>
                    </Pressable>

                    {!isStaff && (
                        <>
                            <Pressable
                                onPress={() => onNavigate("Bookings")}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: scale(12),
                                    paddingHorizontal: scale(12),
                                    borderRadius: 8,
                                }}
                            >
                                <MaterialIcons name="event-note" size={scale(20)} color={colors.primary} />
                                <Text
                                    style={{
                                        marginLeft: scale(12),
                                        fontSize: scale(14),
                                        color: colors.primary,
                                        fontWeight: "500",
                                    }}
                                >
                                    {t("bookings")}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => onNavigate("PaymentHistory")}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: scale(12),
                                    paddingHorizontal: scale(12),
                                    borderRadius: 8,
                                }}
                            >
                                <MaterialIcons name="payment" size={scale(20)} color={colors.primary} />
                                <Text
                                    style={{
                                        marginLeft: scale(12),
                                        fontSize: scale(14),
                                        color: colors.primary,
                                        fontWeight: "500",
                                    }}
                                >
                                    {language === 'vi' ? 'Lịch sử thanh toán' : 'Payment History'}
                                </Text>
                            </Pressable>
                        </>
                    )}

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: scale(4) }} />

                    <Pressable
                        onPress={onOpenLanguageModal}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: scale(12),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                        }}
                    >
                        <MaterialIcons name="language" size={scale(20)} color={colors.primary} />
                        <Text
                            style={{
                                marginLeft: scale(12),
                                fontSize: scale(14),
                                color: colors.primary,
                                fontWeight: "500",
                            }}
                        >
                            {t("language")}
                        </Text>
                        <Text style={{ marginLeft: scale(8), fontSize: scale(12), color: colors.placeholder }}>
                            ({language === "en" ? "EN" : "VI"})
                        </Text>
                    </Pressable>

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: scale(4) }} />

                    <Pressable
                        onPress={onLogout}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: scale(12),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                        }}
                    >
                        <MaterialIcons name="logout" size={scale(20)} color="#EF4444" />
                        <Text
                            style={{
                                marginLeft: scale(12),
                                fontSize: scale(14),
                                color: "#EF4444",
                                fontWeight: "500",
                            }}
                        >
                            {t("logout")}
                        </Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    )
}
