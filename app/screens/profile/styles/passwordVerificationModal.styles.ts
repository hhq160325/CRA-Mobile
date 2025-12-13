import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: scale(16),
        padding: scale(24),
        width: "85%",
        maxWidth: scale(350),
    },
    header: {
        alignItems: "center",
        marginBottom: verticalScale(16),
    },
    iconContainer: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: verticalScale(12),
    },
    title: {
        fontSize: scale(18),
        fontWeight: "700",
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    description: {
        fontSize: scale(14),
        color: colors.placeholder,
        textAlign: "center",
        lineHeight: scale(20),
    },
    inputContainer: {
        position: "relative",
        marginBottom: verticalScale(20),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        paddingRight: scale(50),
        fontSize: scale(14),
        color: colors.primary,
    },
    toggleButton: {
        position: "absolute",
        right: scale(12),
        top: "50%",
        transform: [{ translateY: -scale(12) }],
    },
    buttonRow: {
        flexDirection: "row",
        gap: scale(12),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.morentBlue,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.morentBlue,
    },
    verifyButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        backgroundColor: colors.morentBlue,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    verifyButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    verifyButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.white,
    },
    loadingIndicator: {
        marginRight: scale(8),
    },
});