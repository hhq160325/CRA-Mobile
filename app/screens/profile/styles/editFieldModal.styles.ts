import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
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
        maxHeight: "80%",
    },
    scrollView: {
        flexGrow: 1,
    },
    title: {
        fontSize: scale(18),
        fontWeight: "700",
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    helpText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(16),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        fontSize: scale(14),
        color: colors.primary,
        marginBottom: verticalScale(20),
        minHeight: verticalScale(44),
    },
    multilineInput: {
        minHeight: verticalScale(80),
        textAlignVertical: "top",
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
    saveButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        backgroundColor: colors.morentBlue,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    saveButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    saveButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.white,
    },
    loadingIndicator: {
        marginRight: scale(8),
    },
});