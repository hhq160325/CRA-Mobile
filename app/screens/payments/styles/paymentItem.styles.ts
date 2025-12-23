import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
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