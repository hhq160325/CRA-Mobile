import { StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
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
});