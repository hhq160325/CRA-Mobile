import React from "react"
import { View, Text, Pressable, Modal } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { useLanguage } from "../../../../lib/language-context"
import type { Language } from "../../../../lib/translations"

interface LanguageModalProps {
    visible: boolean
    onClose: () => void
    currentLanguage: Language
    onSelectLanguage: (lang: Language) => void
}

export default function LanguageModal({ visible, onClose, currentLanguage, onSelectLanguage }: LanguageModalProps) {
    const { t } = useLanguage()

    const handleSelectLanguage = (lang: Language) => {
        console.log(`Switching to ${lang === "en" ? "English" : "Vietnamese"}`)
        onSelectLanguage(lang)
        setTimeout(() => onClose(), 100)
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onPress={onClose}
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
                    <Text
                        style={{
                            fontSize: scale(18),
                            fontWeight: "700",
                            color: colors.primary,
                            marginBottom: scale(16),
                        }}
                    >
                        {t("language")}
                    </Text>

                    <Pressable
                        onPress={() => handleSelectLanguage("en")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: scale(14),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                            backgroundColor: currentLanguage === "en" ? colors.morentBlue + "20" : colors.background,
                            marginBottom: scale(8),
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(24), marginRight: scale(12) }}>🇬🇧</Text>
                            <Text
                                style={{
                                    fontSize: scale(16),
                                    color: colors.primary,
                                    fontWeight: currentLanguage === "en" ? "600" : "400",
                                }}
                            >
                                English
                            </Text>
                        </View>
                        {currentLanguage === "en" && (
                            <MaterialIcons name="check-circle" size={scale(20)} color={colors.morentBlue} />
                        )}
                    </Pressable>

                    <Pressable
                        onPress={() => handleSelectLanguage("vi")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: scale(14),
                            paddingHorizontal: scale(12),
                            borderRadius: 8,
                            backgroundColor: currentLanguage === "vi" ? colors.morentBlue + "20" : colors.background,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(24), marginRight: scale(12) }}>🇻🇳</Text>
                            <Text
                                style={{
                                    fontSize: scale(16),
                                    color: colors.primary,
                                    fontWeight: currentLanguage === "vi" ? "600" : "400",
                                }}
                            >
                                Tiếng Việt
                            </Text>
                        </View>
                        {currentLanguage === "vi" && (
                            <MaterialIcons name="check-circle" size={scale(20)} color={colors.morentBlue} />
                        )}
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    )
}
