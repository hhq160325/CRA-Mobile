import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: colors.white,
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        height: verticalScale(44),
        fontSize: scale(14),
        color: colors.primary,
    },
});