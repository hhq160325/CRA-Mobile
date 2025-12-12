import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(12),
    },
    addButton: {
        backgroundColor: '#f59e0b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    addButtonText: {
        color: colors.white,
        fontSize: scale(15),
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: scale(16),
        borderTopRightRadius: scale(16),
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#1f2937',
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        maxHeight: verticalScale(300),
    },
    feeItem: {
        backgroundColor: '#f9fafb',
        borderRadius: scale(10),
        padding: scale(12),
        marginVertical: verticalScale(6),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    feeItemSelected: {
        borderColor: colors.morentBlue,
        backgroundColor: '#eff6ff',
    },
    feeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    feeIconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    feeInfo: {
        flex: 1,
    },
    feeName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#1f2937',
    },
    feeAmount: {
        fontSize: scale(13),
        color: '#ef4444',
        fontWeight: '500',
    },
    feeDescription: {
        fontSize: scale(12),
        color: '#6b7280',
        lineHeight: scale(16),
    },
    hoursSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
        paddingTop: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    hoursLabel: {
        fontSize: scale(13),
        color: '#374151',
        marginRight: scale(10),
    },
    hoursButton: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hoursValue: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#1f2937',
        marginHorizontal: scale(12),
    },
    footer: {
        padding: scale(16),
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    totalLabel: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#1f2937',
    },
    totalAmount: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#ef4444',
    },
    submitButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: scale(15),
        fontWeight: '600',
    },

    // WebView Modal Styles
    webViewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    webViewLoadingText: {
        marginTop: verticalScale(12),
        fontSize: scale(16),
        color: '#6b7280',
    },

});
