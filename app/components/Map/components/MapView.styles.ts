import { StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

export const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderRadius: scale(12),
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
    controls: {
        position: "absolute",
        right: scale(16),
        top: scale(16),
        gap: scale(8),
    },
    controlButton: {
        backgroundColor: "white",
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerContainer: {
        alignItems: "center",
    },
    markerIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    priceTag: {
        backgroundColor: "white",
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        marginTop: scale(4),
        borderWidth: 1,
        borderColor: colors.border,
    },
    priceText: {
        fontSize: scale(12),
        fontWeight: "bold",
        color: colors.primary,
    },
})
