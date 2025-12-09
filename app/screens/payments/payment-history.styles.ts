import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    headerSection: {
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(8),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
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
    errorText: {
        fontSize: scale(16),
        color: '#ef4444',
        textAlign: 'center',
        marginTop: verticalScale(16),
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    emptyContainer: {
        padding: scale(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.placeholder,
        marginTop: verticalScale(16),
    },
    bookingCard: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    bookingHeaderContent: {
        flex: 1,
    },
    carName: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    totalAmount: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.morentBlue,
    },
    expandedSection: {
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    paymentItem: {
        paddingVertical: verticalScale(12),
    },
    paymentItemWithBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    paymentHeaderContent: {
        flex: 1,
    },
    paymentItemName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    orderCode: {
        fontSize: scale(11),
        color: colors.placeholder,
        marginTop: verticalScale(2),
    },
    statusBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    statusText: {
        fontSize: scale(11),
        fontWeight: '600',
    },
    paymentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentMethod: {
        fontSize: scale(11),
        color: colors.placeholder,
    },
    paymentDate: {
        fontSize: scale(10),
        color: colors.placeholder,
        marginTop: verticalScale(2),
    },
    paymentAmount: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.morentBlue,
    },
});
