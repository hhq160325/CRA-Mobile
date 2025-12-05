import { StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(16),
        color: colors.placeholder,
    },
    routeInfo: {
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    routeInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
    },
    routeInfoText: {
        gap: verticalScale(4),
    },
    routeInfoTitle: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    routeInfoValue: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
    },
    stationsContainer: {
        flex: 1,
        backgroundColor: "white",
        padding: scale(16),
    },
    stationsTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(12),
    },
    stationsList: {
        flex: 1,
    },
    stationCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: scale(12),
        padding: scale(12),
        marginBottom: verticalScale(8),
        gap: scale(12),
    },
    stationNumber: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.morentBlue,
        justifyContent: "center",
        alignItems: "center",
    },
    stationNumberText: {
        fontSize: scale(14),
        fontWeight: "bold",
        color: "white",
    },
    stationInfo: {
        flex: 1,
        gap: verticalScale(4),
    },
    stationName: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
    stationDetails: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    actionButtons: {
        flexDirection: "row",
        padding: scale(16),
        gap: scale(12),
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        gap: scale(8),
    },
    primaryButton: {
        backgroundColor: colors.morentBlue,
    },
    secondaryButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: "white",
    },
    secondaryButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
})
