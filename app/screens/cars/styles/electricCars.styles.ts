import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: colors.placeholder,
    },
    headerContainer: {
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: colors.primary,
    },
    filterContainer: {
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00B050',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(20),
        alignSelf: 'flex-start',
        gap: scale(4),
    },
    filterText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: 'white',
    },
    listContainer: {
        padding: scale(16),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(60),
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.placeholder,
        marginTop: scale(16),
        textAlign: 'center',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginTop: scale(8),
        textAlign: 'center',
    },
    carCard: {
        backgroundColor: colors.white,
        marginBottom: scale(16),
        borderRadius: scale(12),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    carCardContent: {
        padding: scale(16),
    },
    carHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    carHeaderContent: {
        flex: 1,
    },
    carTitle: {
        fontSize: scale(16),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: scale(4),
    },
    electricBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(12),
        alignSelf: 'flex-start',
        gap: scale(2),
    },
    electricText: {
        fontSize: scale(10),
        fontWeight: '700',
        color: '#00B050',
        textTransform: 'uppercase',
    },
    favoriteButton: {
        padding: scale(8),
    },
    carImage: {
        height: scale(120),
        backgroundColor: colors.background,
        borderRadius: scale(8),
        marginBottom: scale(12),
        overflow: 'hidden',
    },
    carImageContent: {
        width: '100%',
        height: '100%',
    },
    carDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(12),
        flexWrap: 'wrap',
        gap: scale(8),
    },
    carDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    carDetailText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    priceRentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: scale(16),
        fontWeight: '700',
        color: colors.primary,
    },
    ecoText: {
        fontSize: scale(12),
        color: '#00B050',
        marginTop: scale(2),
        fontWeight: '500',
    },
    rentButton: {
        backgroundColor: '#00B050',
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: scale(6),
    },
    rentButtonText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.white,
    },
});