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
