import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filterBar: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    refreshButton: {
        padding: scale(8),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(12),
        color: colors.placeholder,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(16),
    },
    errorText: {
        marginTop: verticalScale(12),
        color: colors.destructive,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: verticalScale(16),
        paddingHorizontal: scale(24),
        paddingVertical: scale(12),
        backgroundColor: colors.morentBlue,
        borderRadius: scale(8),
    },
    retryButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    listContent: {
        padding: scale(16),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: verticalScale(40),
    },
    emptyIcon: {
        marginBottom: verticalScale(12),
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.placeholder,
        fontWeight: '600',
    },
    feedbackCard: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        marginBottom: scale(16),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cardHeaderContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: scale(14),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    cardUserName: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    cardContent: {
        padding: scale(16),
    },
    starsContainer: {
        flexDirection: 'row',
        marginVertical: verticalScale(4),
    },
    starIcon: {
        marginRight: scale(2),
    },
    messageContainer: {
        marginVertical: verticalScale(8),
    },
    messageText: {
        fontSize: scale(13),
        color: colors.primary,
        lineHeight: scale(18),
    },
    cardFooter: {
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: scale(11),
        color: colors.placeholder,
    },
});
