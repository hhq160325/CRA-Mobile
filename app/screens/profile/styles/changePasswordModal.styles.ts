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
        width: "90%",
        maxWidth: scale(400),
    },
    title: {
        fontSize: scale(20),
        fontWeight: "700",
        color: colors.primary,
        marginBottom: verticalScale(8),
        textAlign: "center",
    },
    description: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginBottom: verticalScale(24),
        textAlign: "center",
        lineHeight: scale(20),
    },
    inputContainer: {
        position: "relative",
        marginBottom: verticalScale(16),
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
        minHeight: verticalScale(44),
    },
    eyeIcon: {
        position: "absolute",
        right: scale(16),
        top: verticalScale(12),
        padding: scale(4),
    },
    otpInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        fontSize: scale(18),
        color: colors.primary,
        minHeight: verticalScale(44),
        marginBottom: verticalScale(24),
        letterSpacing: scale(4),
        fontWeight: "600",
    },
    buttonRow: {
        flexDirection: "row",
        gap: scale(12),
        marginTop: verticalScale(8),
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
    submitButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        backgroundColor: colors.morentBlue,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    submitButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.white,
    },
    loadingIndicator: {
        marginRight: scale(8),
    },
});