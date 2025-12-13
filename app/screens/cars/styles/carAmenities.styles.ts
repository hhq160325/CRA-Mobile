import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        marginTop: scale(20),
    },
    title: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: scale(12),
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: scale(12),
        paddingVertical: scale(8),
        borderRadius: scale(20),
        borderWidth: 1,
        borderColor: colors.border,
    },
    amenityText: {
        fontSize: scale(12),
        color: colors.primary,
        marginLeft: scale(6),
        fontWeight: '500',
    },
});