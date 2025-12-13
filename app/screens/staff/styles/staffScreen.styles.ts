import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(14),
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(32),
    },
    errorTitle: {
        fontSize: scale(16),
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: verticalScale(16),
    },
    errorMessage: {
        fontSize: scale(14),
        color: '#6b7280',
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    searchBar: {
        backgroundColor: 'white',
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        height: verticalScale(44),
        fontSize: scale(14),
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(16),
        gap: scale(8),
    },
    filterButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(20),
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonInactive: {
        backgroundColor: '#f3f4f6',
    },
    filterText: {
        fontSize: scale(12),
        fontWeight: '600',
        textAlign: 'center',
    },
    filterTextActive: {
        color: 'white',
    },
    filterTextInactive: {
        color: '#6b7280',
    },
    emptyContainer: {
        padding: scale(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(16),
        color: '#6b7280',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    cardHeaderContent: {
        flex: 1,
    },
    carName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    licensePlate: {
        fontSize: scale(12),
        color: '#6b7280',
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadgeSuccess: {
        backgroundColor: '#d1fae5',
    },
    statusBadgeCancelled: {
        backgroundColor: '#fee2e2',
    },
    statusBadgePending: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: '600',
    },
    statusTextSuccess: {
        color: '#059669',
    },
    statusTextCancelled: {
        color: '#991b1b',
    },
    statusTextPending: {
        color: '#d97706',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: verticalScale(12),
    },
    detailColumn: {
        flex: 1,
    },
    detailLabel: {
        fontSize: scale(10),
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: verticalScale(4),
    },
    detailValue: {
        fontSize: scale(13),
        fontWeight: '600',
        color: colors.primary,
    },
    detailValueBold: {
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestPaymentButton: {
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: scale(8),
    },
    requestPaymentButtonActive: {
        backgroundColor: colors.morentBlue,
        opacity: 1,
    },
    requestPaymentButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    requestPaymentText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.white,
    },
    confirmPickupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    confirmPickupText: {
        fontSize: scale(13),
        fontWeight: '600',
    },
    confirmPickupTextComplete: {
        color: '#00B050',
    },
    confirmPickupTextIncomplete: {
        color: colors.primary,
    },
    confirmPickupArrow: {
        fontSize: scale(20),
    },
    // Extension Information Styles
    extensionInfo: {
        backgroundColor: '#fef3c7',
        borderRadius: scale(8),
        padding: scale(12),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8),
        borderLeftWidth: scale(4),
        borderLeftColor: '#f59e0b',
    },
    extensionHeader: {
        marginBottom: verticalScale(4),
    },
    extensionLabel: {
        fontSize: scale(10),
        fontWeight: '600',
        color: '#92400e',
        letterSpacing: 0.5,
    },
    extensionDescription: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#92400e',
        marginBottom: verticalScale(4),
    },
    extensionAmount: {
        fontSize: scale(12),
        color: '#a16207',
        fontWeight: '500',
    },
    extensionDescriptionButton: {
        marginBottom: verticalScale(4),
    },
    extensionDescriptionClickable: {
        textDecorationLine: 'underline',
        color: '#1d4ed8',
    },
    extensionPaymentLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
});