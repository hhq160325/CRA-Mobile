import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const gpsMonitoringStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
    },
    loadingText: {
        fontSize: scale(16),
        color: '#374151',
        marginTop: verticalScale(16),
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scale(16),
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        marginLeft: scale(4),
    },
    title: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.primary,
    },
    titleContainer: {
        flex: 1,
    },
    subtitle: {
        fontSize: scale(12),
        color: '#6b7280',
        marginTop: verticalScale(2),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: scale(16),
        marginVertical: verticalScale(12),
        paddingHorizontal: scale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        flex: 1,
        height: verticalScale(44),
        fontSize: scale(14),
        marginLeft: scale(8),
        color: '#374151',
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    locationCard: {
        backgroundColor: 'white',
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(2),
    },
    userEmail: {
        fontSize: scale(14),
        color: '#6b7280',
        marginBottom: verticalScale(2),
    },
    userId: {
        fontSize: scale(12),
        color: '#9ca3af',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    statusBadgeOnline: {
        backgroundColor: '#d1fae5',
    },
    statusBadgeOffline: {
        backgroundColor: '#fee2e2',
    },
    statusDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        marginRight: scale(4),
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
    locationInfo: {
        marginBottom: verticalScale(12),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    locationText: {
        fontSize: scale(14),
        color: colors.primary,
        marginLeft: scale(6),
        fontWeight: '500',
    },
    speedText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginLeft: scale(6),
    },
    timeText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginLeft: scale(6),
    },
    deviceText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginLeft: scale(6),
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    timestampText: {
        fontSize: scale(12),
        color: '#6b7280',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
    },
    errorText: {
        fontSize: scale(16),
        color: '#ef4444',
        textAlign: 'center',
        marginVertical: verticalScale(16),
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    retryButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: 'white',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: verticalScale(64),
    },
    emptyText: {
        fontSize: scale(16),
        color: '#6b7280',
        textAlign: 'center',
        marginTop: verticalScale(16),
    },
    emptySubtext: {
        fontSize: scale(14),
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: verticalScale(8),
    },
    // Address display styles
    addressContainer: {
        flex: 1,
        marginLeft: scale(6),
    },
    addressText: {
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: '500',
        lineHeight: scale(18),
    },
    coordinatesText: {
        fontSize: scale(12),
        color: '#6b7280',
        marginLeft: scale(6),
    },
});