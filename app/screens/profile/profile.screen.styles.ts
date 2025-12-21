import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(16),
        color: colors.placeholder,
    },
    accountDetailsCard: {
        marginHorizontal: scale(16),
        marginVertical: verticalScale(12),
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
    },
    bottomSpacer: {
        height: verticalScale(20),
    },
    behaviorScoreField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    behaviorScoreLabel: {
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: '500',
    },
    behaviorScoreValue: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
    },
    behaviorScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    behaviorScoreBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        backgroundColor: colors.green,
    },
    behaviorScoreBadgeText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.white,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        zIndex: 1000,
        elevation: 1000,
    },
});
