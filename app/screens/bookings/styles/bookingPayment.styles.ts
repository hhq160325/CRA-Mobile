import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholder,
        marginBottom: 24,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    cardCentered: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    rowBordered: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    label: {
        fontSize: 14,
        color: colors.placeholder,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.morentBlue,
    },
    icon: {
        marginBottom: 16,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    paymentDescription: {
        fontSize: 14,
        color: colors.placeholder,
        textAlign: 'center',
        marginBottom: 24,
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: colors.placeholder,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 16,
    },
    qrImage: {
        width: 250,
        height: 250,
        marginBottom: 16,
    },
    qrDescription: {
        fontSize: 14,
        color: colors.placeholder,
        textAlign: 'center',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    statusText: {
        marginLeft: 8,
        color: colors.placeholder,
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: '#00B050',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    successText: {
        marginLeft: 8,
        color: colors.white,
        fontWeight: '600',
    },
    errorText: {
        color: colors.placeholder,
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: colors.morentBlue,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.morentBlue,
        fontSize: 16,
        fontWeight: '600',
    },
});