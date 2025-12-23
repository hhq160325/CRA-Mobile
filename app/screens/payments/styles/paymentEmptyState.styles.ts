import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    emptyContainer: {
        padding: scale(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.placeholder,
        marginTop: verticalScale(16),
    },
    emptySubText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: verticalScale(8),
    },
});