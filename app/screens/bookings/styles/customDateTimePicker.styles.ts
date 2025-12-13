import { StyleSheet } from 'react-native'
import { colors } from '../../../theme/colors'

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    scrollView: {
        maxHeight: 600,
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    monthNavigationButton: {
        padding: 8,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    dayNamesContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    dayNameCell: {
        width: '14.28%',
        alignItems: 'center',
    },
    dayNameText: {
        fontSize: 12,
        color: colors.placeholder,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    emptyDayCell: {
        width: '14.28%',
        padding: 8,
    },
    dayCell: {
        width: '14.28%',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleSelected: {
        backgroundColor: colors.morentBlue,
    },
    dayCircleUnselected: {
        backgroundColor: 'transparent',
    },
    dayText: {
        fontSize: 14,
    },
    dayTextDisabled: {
        color: '#ccc',
    },
    dayTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
    dayTextUnselected: {
        color: colors.primary,
        fontWeight: '400',
    },
    timeSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 16,
    },
    timeSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12,
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        height: 200,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timeColumn: {
        flex: 1,
    },
    timeScrollContent: {
        paddingVertical: 75,
    },
    timeItem: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
    },
    timeItemSelected: {
        backgroundColor: '#4A5568',
    },
    timeItemUnselected: {
        backgroundColor: 'transparent',
    },
    timeText: {
        fontWeight: '400',
    },
    timeTextSelected: {
        fontSize: 32,
        color: colors.white,
        fontWeight: '700',
    },
    timeTextUnselected: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    timeTextDisabled: {
        color: '#D1D5DB',
    },
    timeSeparator: {
        fontSize: 32,
        color: colors.primary,
        fontWeight: '600',
        marginHorizontal: 8,
    },
    selectedTimeDisplay: {
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
        alignItems: 'center',
    },
    selectedTimeLabel: {
        fontSize: 12,
        color: colors.placeholder,
        marginBottom: 4,
    },
    selectedTimeValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.morentBlue,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
})