import { StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

export const vehicleReturnStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(14),
        color: "#6b7280",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    errorText: {
        fontSize: scale(16),
        color: "#ef4444",
        marginTop: verticalScale(16),
        marginBottom: verticalScale(24),
        textAlign: "center",
    },
    backButtonError: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    backButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: "600",
    },
})
