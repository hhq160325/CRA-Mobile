import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
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
});