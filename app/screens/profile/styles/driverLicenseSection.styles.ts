import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        marginBottom: verticalScale(24),
    },
    title: {
        fontSize: scale(18),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    licenseImage: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: scale(12),
        marginBottom: verticalScale(12),
    },
    changePhotoButton: {
        backgroundColor: colors.morentBlue,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(24),
        borderRadius: scale(8),
        alignItems: 'center',
    },
    changePhotoButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.white,
    },
    uploadContainer: {
        borderWidth: 2,
        borderColor: colors.morentBlue,
        borderStyle: 'dashed',
        borderRadius: scale(12),
        paddingVertical: verticalScale(40),
        paddingHorizontal: scale(24),
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    uploadTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.morentBlue,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(4),
    },
    uploadSubtitle: {
        fontSize: scale(12),
        color: colors.placeholder,
        textAlign: 'center',
    },
});