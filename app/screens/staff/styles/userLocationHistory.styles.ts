import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const userLocationHistoryStyles = StyleSheet.create({
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
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        marginLeft: scale(4),
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        flex: 1,
        textAlign: 'center',
        marginRight: scale(60), // Balance the back button
    },
    userInfoCard: {
        backgroundColor: 'white',
        marginHorizontal: scale(16),
        marginVertical: verticalScale(12),
        padding: scale(16),
        borderRadius: scale(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfoContent: {
        flex: 1,
    },
    userInfoName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    userInfoEmail: {
        fontSize: scale(14),
        color: '#6b7280',
        marginBottom: verticalScale(2),
    },
    userInfoPhone: {
        fontSize: scale(14),
        color: '#6b7280',
    },
    locationCount: {
        alignItems: 'center',
        paddingLeft: scale(16),
    },
    locationCountNumber: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
    },
    locationCountLabel: {
        fontSize: scale(12),
        color: '#6b7280',
        marginTop: verticalScale(2),
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    locationItem: {
        flexDirection: 'row',
        marginBottom: verticalScale(16),
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: scale(12),
        width: scale(20),
    },
    timelineDot: {
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        marginTop: verticalScale(4),
    },
    timelineDotLatest: {
        backgroundColor: colors.primary,
    },
    timelineDotNormal: {
        backgroundColor: '#9ca3af',
    },
    timelineLine: {
        width: scale(2),
        flex: 1,
        backgroundColor: '#e5e7eb',
        marginTop: verticalScale(4),
    },
    locationContent: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: scale(12),
        padding: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    locationTime: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    timeAgo: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    locationDetails: {
        gap: verticalScale(8),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coordinatesText: {
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
    deviceText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginLeft: scale(6),
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
    addressText: {
        fontSize: scale(14),
        color: colors.primary,
        marginLeft: scale(6),
        fontWeight: '500',
        flex: 1,
        lineHeight: scale(18),
    },
});