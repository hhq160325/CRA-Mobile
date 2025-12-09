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
});
