import { StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'
import { scale, verticalScale } from '../../theme/scale'

export const styles = StyleSheet.create({
    container: {
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(12),
    },
    tabContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    tab: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    selectedTab: {
        backgroundColor: colors.morentBlue,
        borderColor: colors.morentBlue,
    },
    tabText: {
        fontSize: scale(14),
        color: colors.primary,
    },
    selectedTabText: {
        color: colors.white,
        fontWeight: '600',
    },
})
