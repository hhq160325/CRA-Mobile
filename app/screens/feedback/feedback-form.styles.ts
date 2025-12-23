import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: scale(16),
        paddingBottom: verticalScale(24),
    },
    title: {
        fontSize: scale(20),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: scale(13),
        color: colors.placeholder,
        marginBottom: verticalScale(24),
        lineHeight: scale(18),
    },
    bookingNotice: {
        backgroundColor: colors.morentBlue + '15',
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookingNoticeText: {
        fontSize: scale(12),
        color: colors.morentBlue,
        flex: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    cardTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    requiredMark: {
        fontSize: scale(12),
        color: colors.destructive,
        marginLeft: scale(4),
    },
    starContainer: {
        flexDirection: 'row',
        gap: scale(8),
    },
    starButton: {
        padding: scale(8),
    },
    ratingText: {
        fontSize: scale(12),
        color: colors.morentBlue,
        marginTop: verticalScale(8),
        fontWeight: '600',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    categoryButton: {
        paddingHorizontal: scale(12),
        paddingVertical: scale(8),
        borderRadius: scale(20),
        borderWidth: 1,
    },
    categoryButtonActive: {
        backgroundColor: colors.morentBlue,
        borderColor: colors.morentBlue,
    },
    categoryButtonInactive: {
        backgroundColor: colors.background,
        borderColor: colors.border,
    },
    categoryTextActive: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.white,
    },
    categoryTextInactive: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.primary,
    },
    input: {
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(10),
        fontSize: scale(13),
        color: colors.primary,
        backgroundColor: colors.background,
    },
    textArea: {
        minHeight: scale(120),
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: scale(10),
        color: colors.placeholder,
        marginTop: verticalScale(4),
        textAlign: 'right',
    },
    buttonContainer: {
        gap: scale(12),
    },
    submitButton: {
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    submitButtonActive: {
        backgroundColor: colors.morentBlue,
    },
    submitButtonInactive: {
        backgroundColor: colors.border,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: scale(14),
    },
    cancelButton: {
        backgroundColor: colors.background,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        borderWidth: 2,
        borderColor: colors.morentBlue,
    },
    cancelButtonText: {
        color: colors.morentBlue,
        fontSize: scale(14),
        fontWeight: '600',
    },
    iconMargin: {
        marginRight: scale(8),
    },
});
