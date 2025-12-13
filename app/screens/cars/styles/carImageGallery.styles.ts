import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    mainImageContainer: {
        backgroundColor: colors.white,
        paddingVertical: scale(20),
        paddingHorizontal: scale(16),
        marginBottom: scale(8),
    },
    mainImage: {
        width: "100%",
        height: scale(300),
        resizeMode: "contain",
    },
    thumbnailContainer: {
        backgroundColor: colors.white,
        paddingVertical: scale(12),
        paddingHorizontal: scale(8),
        marginBottom: scale(16),
    },
    thumbnailScrollContent: {
        paddingHorizontal: scale(8),
    },
    thumbnailButton: {
        width: scale(110),
        height: scale(90),
        marginRight: scale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailButtonSelected: {
        borderWidth: 3,
        borderColor: colors.morentBlue,
    },
    thumbnailButtonDefault: {
        borderColor: colors.border,
    },
    thumbnailImage: {
        width: "90%",
        height: "90%",
        resizeMode: "contain",
    },
});