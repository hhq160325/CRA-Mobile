import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: scale(16),
        paddingTop: scale(8),
        marginBottom: verticalScale(8),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(16),
    },
    searchContainer: {
        backgroundColor: 'white',
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
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(16),
        gap: scale(8),
    },
    filterButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(20),
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonInactive: {
        backgroundColor: '#f3f4f6',
    },
    filterText: {
        fontSize: scale(12),
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    filterTextActive: {
        color: 'white',
    },
    filterTextInactive: {
        color: '#6b7280',
    },
    emptyContainer: {
        padding: scale(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(16),
        color: '#6b7280',
    },
    bookingCard: {
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
        marginBottom: verticalScale(12),
    },
    cardHeaderLeft: {
        flex: 1,
    },
    carName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        height: scale(28),
        justifyContent: 'center',
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    carImageContainer: {
        borderRadius: scale(8),
        overflow: 'hidden',
        marginBottom: verticalScale(12),
    },
    carImage: {
        width: '100%',
        height: scale(140),
        resizeMode: 'cover',
    },
    locationSection: {
        marginBottom: verticalScale(12),
    },
    sectionLabel: {
        fontSize: scale(10),
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: verticalScale(4),
    },
    locationText: {
        fontSize: scale(13),
        fontWeight: '600',
        color: colors.primary,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: verticalScale(12),
    },
    detailColumn: {
        flex: 1,
    },
    detailColumnRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    detailValue: {
        fontSize: scale(13),
        fontWeight: '600',
        color: colors.primary,
    },
    totalValue: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.primary,
    },
    addonsSection: {
        marginBottom: verticalScale(8),
    },
    addonsText: {
        fontSize: scale(12),
        color: colors.primary,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },
    actionText: {
        fontSize: scale(13),
        fontWeight: '600',
        color: colors.morentBlue,
        marginRight: scale(4),
    },
    actionArrow: {
        fontSize: scale(18),
        color: colors.morentBlue,
    },
});
