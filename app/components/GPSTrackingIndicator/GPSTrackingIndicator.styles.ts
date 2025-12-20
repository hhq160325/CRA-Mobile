import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const gpsIndicatorStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(20),
        marginHorizontal: scale(4),
    },
    containerActive: {
        backgroundColor: '#d1fae5',
    },
    containerInactive: {
        backgroundColor: '#f3f4f6',
    },
    containerError: {
        backgroundColor: '#fee2e2',
    },
    pulsingDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#10b981',
        marginRight: scale(4),
        // Add pulsing animation if needed
    },
    activeText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#065f46',
        marginLeft: scale(4),
    },
    inactiveText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#6b7280',
        marginLeft: scale(4),
    },
    errorText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#991b1b',
        marginLeft: scale(4),
    },
    lastUpdateText: {
        fontSize: scale(10),
        color: '#6b7280',
        marginLeft: scale(6),
    },
});