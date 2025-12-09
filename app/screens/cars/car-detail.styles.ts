import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';

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
    scrollContent: {
        paddingBottom: scale(20),
    },
    carDetailsCard: {
        backgroundColor: colors.white,
        padding: scale(16),
        marginHorizontal: scale(16),
        borderRadius: scale(12),
        marginBottom: scale(16),
    },
    carTitle: {
        fontSize: scale(24),
        fontWeight: '700',
        color: colors.primary,
    },
    carSubtitle: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginTop: scale(4),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
        marginTop: scale(20),
        marginBottom: scale(8),
    },
    description: {
        fontSize: scale(14),
        color: colors.placeholder,
        lineHeight: scale(22),
    },
    depositContainer: {
        marginTop: scale(20),
        padding: scale(16),
        backgroundColor: colors.background,
        borderRadius: scale(8),
        borderLeftWidth: 4,
        borderLeftColor: colors.morentBlue,
    },
    depositHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    depositTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
    },
    depositList: {
        marginLeft: scale(4),
    },
    depositItem: {
        flexDirection: 'row',
        marginBottom: scale(6),
    },
    depositBullet: {
        fontSize: scale(14),
        color: colors.primary,
        marginRight: scale(4),
    },
    depositText: {
        fontSize: scale(14),
        color: colors.primary,
        flex: 1,
        lineHeight: scale(20),
    },
    depositAmount: {
        fontWeight: '600',
        color: colors.morentBlue,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        paddingVertical: scale(12),
        borderRadius: scale(8),
        marginTop: scale(20),
        borderWidth: 1,
        borderColor: colors.morentBlue,
    },
    contactEmoji: {
        fontSize: scale(20),
        marginRight: scale(8),
    },
    contactText: {
        color: colors.morentBlue,
        fontSize: scale(14),
        fontWeight: '600',
    },
    priceBookContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(16),
        paddingTop: scale(16),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: scale(12),
    },
    priceContainer: {
        flex: 1,
        minWidth: 0,
    },
    priceLabel: {
        fontSize: scale(11),
        color: colors.placeholder,
    },
    priceValue: {
        fontSize: scale(18),
        fontWeight: '700',
        color: colors.morentBlue,
        flexWrap: 'wrap',
    },
    bookButton: {
        backgroundColor: colors.morentBlue,
        paddingHorizontal: scale(24),
        paddingVertical: scale(12),
        borderRadius: scale(8),
        flexShrink: 0,
    },
    bookButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: '600',
    },
    notFoundText: {
        fontSize: scale(16),
        color: colors.placeholder,
    },
});
