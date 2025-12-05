import React from "react"
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

interface ActionButtonProps {
    onPress: () => void
    disabled?: boolean
    loading?: boolean
    text: string
    iconName?: string
    isCompleted?: boolean
}

export default function ActionButton({
    onPress,
    disabled = false,
    loading = false,
    text,
    iconName = "check-circle",
    isCompleted = false
}: ActionButtonProps) {
    if (isCompleted) {
        return (
            <View style={styles.actionButtons}>
                <View style={styles.completedBadge}>
                    <MaterialIcons name="check-circle" size={24} color="#10b981" />
                    <Text style={styles.completedText}>Return Already Completed</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.actionButtons}>
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.confirmButton,
                    (disabled || loading) && styles.confirmButtonDisabled
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <>
                        <MaterialIcons name={iconName as any} size={20} color={colors.white} />
                        <Text style={styles.confirmButtonText}>{text}</Text>
                    </>
                )}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    actionButtons: {
        padding: scale(16),
        gap: verticalScale(12),
        marginBottom: verticalScale(24),
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        gap: scale(8),
    },
    confirmButtonDisabled: {
        backgroundColor: "#9ca3af",
        opacity: 0.6,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: scale(16),
        fontWeight: "600",
    },
    completedBadge: {
        backgroundColor: "#d1fae5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        gap: scale(8),
    },
    completedText: {
        color: "#10b981",
        fontSize: scale(16),
        fontWeight: "600",
    },
})
