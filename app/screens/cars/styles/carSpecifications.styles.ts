import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    licensePlateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(8),
        gap: scale(12),
    },
    licensePlate: {
        backgroundColor: colors.background,
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(6),
        borderWidth: 1,
        borderColor: colors.border,
    },
    licensePlateText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.primary,
    },
    statusActive: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(6),
    },
    statusInactive: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(6),
    },
    statusTextActive: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#4CAF50',
    },
    statusTextInactive: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#FF9800',
    },
    specsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: scale(20),
        paddingVertical: scale(16),
        backgroundColor: colors.background,
        borderRadius: scale(8),
    },
    specItem: {
        alignItems: 'center',
    },
    specLabel: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: scale(4),
    },
    specValue: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
    },
    parkingContainer: {
        marginTop: scale(16),
        padding: scale(16),
        backgroundColor: colors.background,
        borderRadius: scale(8),
        borderLeftWidth: 4,
        borderLeftColor: colors.morentBlue,
    },
    parkingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    parkingTitle: {
        fontSize: scale(15),
        fontWeight: '600',
        color: colors.primary,
        marginLeft: scale(8),
    },
    parkingName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: scale(4),
    },
    parkingAddress: {
        fontSize: scale(13),
        color: colors.placeholder,
        marginBottom: scale(2),
    },
    parkingCity: {
        fontSize: scale(13),
        color: colors.placeholder,
        marginBottom: scale(8),
    },
    parkingContact: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(4),
    },
    parkingContactText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(6),
    },
    parkingNotes: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: scale(6),
        fontStyle: 'italic',
    },
});