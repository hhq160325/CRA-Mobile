import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const userLocationCardStyles = StyleSheet.create({
    container: {
        backgroundColor: '#f8fafc',
        borderRadius: scale(8),
        padding: scale(12),
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    containerCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(8),
        gap: scale(6),
    },
    containerError: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    loadingText: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    statusDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
    },
    statusDotOnline: {
        backgroundColor: '#10b981',
    },
    statusDotOffline: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: '600',
    },
    statusTextOnline: {
        color: '#065f46',
    },
    statusTextOffline: {
        color: '#991b1b',
    },
    timeText: {
        fontSize: scale(11),
        color: '#6b7280',
    },
    locationInfo: {
        gap: verticalScale(4),
        marginBottom: verticalScale(8),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(6),
    },
    coordinatesText: {
        fontSize: scale(12),
        color: colors.primary,
        fontWeight: '500',
        flex: 1,
    },
    speedText: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    deviceText: {
        fontSize: scale(11),
        color: '#9ca3af',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingVertical: verticalScale(4),
        paddingHorizontal: scale(8),
        borderRadius: scale(6),
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    actionText: {
        fontSize: scale(11),
        color: colors.primary,
        fontWeight: '500',
    },
    // Compact mode styles
    compactText: {
        fontSize: scale(11),
        fontWeight: '500',
        flex: 1,
    },
    compactTextOnline: {
        color: '#065f46',
    },
    compactTextOffline: {
        color: '#6b7280',
    },
    errorText: {
        fontSize: scale(11),
        color: '#991b1b',
        flex: 1,
    },
    retryButton: {
        padding: scale(2),
    },
    errorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    // Address display styles
    addressContainer: {
        flex: 1,
        marginLeft: scale(6),
    },
    addressText: {
        fontSize: scale(12),
        color: colors.primary,
        fontWeight: '500',
        lineHeight: scale(18),
        flexWrap: 'wrap',
    },
    addressLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    addressLoadingText: {
        fontSize: scale(11),
        color: '#6b7280',
    },
});