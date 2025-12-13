import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    headerSection: {
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(8),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(16),
    },
});