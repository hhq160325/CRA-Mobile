import { StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        padding: scale(16),
        backgroundColor: "white",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: scale(12),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        gap: scale(8),
    },
    searchInput: {
        flex: 1,
        fontSize: scale(14),
        color: colors.primary,
    },
    selectedAddressContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: scale(16),
        gap: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectedAddressText: {
        flex: 1,
    },
    selectedAddressLabel: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.placeholder,
        marginBottom: verticalScale(4),
    },
    selectedAddress: {
        fontSize: scale(14),
        color: colors.primary,
    },
    locationsContainer: {
        flex: 1,
        backgroundColor: "white",
        marginTop: verticalScale(8),
    },
    locationsTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
        padding: scale(16),
        paddingBottom: verticalScale(8),
    },
    locationsList: {
        flex: 1,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: scale(12),
    },
    locationIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    locationAddress: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(2),
    },
    locationHours: {
        fontSize: scale(11),
        color: colors.morentBlue,
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        margin: scale(16),
        paddingVertical: verticalScale(16),
        borderRadius: scale(12),
        alignItems: "center",
    },
    confirmButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    confirmButtonText: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: "white",
    },
})
