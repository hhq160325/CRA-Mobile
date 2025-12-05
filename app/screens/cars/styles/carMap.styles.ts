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
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: scale(8),
    },
    locationText: {
        flex: 1,
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: "500",
    },
    radiusControl: {
        backgroundColor: "white",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    radiusLabel: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    radiusButtons: {
        flexDirection: "row",
        gap: scale(8),
    },
    radiusButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    radiusButtonActive: {
        backgroundColor: colors.morentBlue,
        borderColor: colors.morentBlue,
    },
    radiusButtonText: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.primary,
    },
    radiusButtonTextActive: {
        color: "white",
    },
    carListContainer: {
        backgroundColor: "white",
        paddingVertical: verticalScale(16),
    },
    carListHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(12),
    },
    carListTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
    },
    carList: {
        paddingHorizontal: scale(16),
    },
    carCard: {
        width: scale(200),
        backgroundColor: colors.background,
        borderRadius: scale(12),
        padding: scale(12),
        marginRight: scale(12),
        borderWidth: 2,
        borderColor: "transparent",
    },
    carCardSelected: {
        borderColor: colors.morentBlue,
    },
    carInfo: {
        marginBottom: verticalScale(8),
    },
    carName: {
        fontSize: scale(14),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    carDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(4),
    },
    carDistance: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    carPrice: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.morentBlue,
    },
    availableBadge: {
        backgroundColor: "#d1fae5",
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
        alignSelf: "flex-start",
    },
    availableText: {
        fontSize: scale(10),
        fontWeight: "600",
        color: "#00B050",
    },
    unavailableBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
        alignSelf: "flex-start",
    },
    unavailableText: {
        fontSize: scale(10),
        fontWeight: "600",
        color: "#ef4444",
    },
    selectedCarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        padding: scale(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    selectedCarInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedCarDetails: {
        flex: 1,
    },
    selectedCarName: {
        fontSize: scale(18),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    selectedCarMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(4),
    },
    selectedCarDistance: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    selectedCarPrice: {
        fontSize: scale(20),
        fontWeight: "bold",
        color: colors.morentBlue,
    },
    viewDetailsButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    viewDetailsText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: "white",
    },
})
