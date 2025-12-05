import { StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'
import { scale, verticalScale } from '../../theme/scale'

export const createStyles = () => StyleSheet.create({
    filterView: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    text: {
        fontSize: scale(18),
        fontWeight: '700',
        color: colors.primary,
    },
    _f08: {
        width: scale(22),
    },
    filterContainer: {
        padding: scale(16),
    },
    frsb: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterTypeText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
    },
    slider: {
        width: '100%',
        height: verticalScale(40),
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: scale(4),
    },
    tabContainerStyle: {
        marginTop: verticalScale(8),
    },
    tabStyle: {
        minWidth: scale(80),
    },
    sitingCapTab: {
        minWidth: scale(60),
    },
    tabTextStyle: {
        fontSize: scale(14),
    },
    placeHolder: {
        fontSize: scale(14),
        color: colors.placeholder,
    },
    clearAll: {
        fontSize: scale(14),
        color: colors.morentBlue,
        fontWeight: '600',
    },
    btnTextStyle: {
        fontSize: scale(14),
    },
    btnContainerStyle: {
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
    },
})
