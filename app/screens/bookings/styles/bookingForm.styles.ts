import { StyleSheet } from 'react-native'
import { colors } from '../../../theme/colors'

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
    scrollContent: {
        paddingBottom: 24,
    },
    stepIndicator: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    stepText: {
        fontSize: 12,
        color: colors.placeholder,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    backButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.morentBlue,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.morentBlue,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        backgroundColor: colors.morentBlue,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
})