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
        maxHeight: scale(200),
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
    stationViewButton: {
        padding: scale(8),
        borderRadius: scale(6),
        borderWidth: 1,
        borderColor: colors.morentBlue,
    },
    locationsContainer: {
        backgroundColor: "white",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    locationCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(12),
        backgroundColor: colors.background,
        borderRadius: scale(12),
        gap: scale(12),
    },
    locationIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.border,
    },
    locationInfo: {
        flex: 1,
        gap: verticalScale(2),
    },
    locationTitle: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.placeholder,
        textTransform: "uppercase",
    },
    locationAddress: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
    locationTime: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    locationButton: {
        padding: scale(8),
        borderRadius: scale(6),
        borderWidth: 1,
        borderColor: colors.morentBlue,
    },
    routeLine: {
        width: 2,
        height: scale(20),
        backgroundColor: colors.border,
        marginLeft: scale(32),
        marginVertical: verticalScale(4),
    },
    navigationContainer: {
        backgroundColor: "white",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    navigationButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        gap: scale(8),
    },
    navigationButtonText: {
        fontSize: scale(16),
        fontWeight: "600",
        color: "white",
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
