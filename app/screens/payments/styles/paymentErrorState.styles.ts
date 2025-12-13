import { StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
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
});