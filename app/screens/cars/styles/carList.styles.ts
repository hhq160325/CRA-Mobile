import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: colors.primary,
    },
    listContainer: {
        padding: scale(16),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(60),
    },
    emptyTitle: {
        fontSize: scale(16),
        color: colors.placeholder,
        marginTop: scale(16),
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: scale(4),
        textAlign: 'center',
        paddingHorizontal: scale(32),
    },
    carCard: {
        backgroundColor: colors.white,
        marginBottom: scale(16),
        borderRadius: scale(12),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    carCardContent: {
        padding: scale(16),
    },
    carHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    carHeaderContent: {
        flex: 1,
    },
    carTitle: {
        fontSize: scale(16),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: scale(4),
    },
    carSubtitle: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    carImage: {
        width: '100%',
        height: scale(120),
        resizeMode: 'contain',
        marginBottom: scale(12),
    },
    carFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    carSpecs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(16),
    },
    carSpecItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    carSpecText: {
        fontSize: scale(11),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        fontSize: scale(16),
        fontWeight: '700',
        color: colors.primary,
    },
    priceUnit: {
        fontSize: scale(11),
        color: colors.placeholder,
    },
});