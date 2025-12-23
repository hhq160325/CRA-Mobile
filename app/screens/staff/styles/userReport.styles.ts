import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: verticalScale(20),
    },

    // Header Section
    headerSection: {
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(24),
        backgroundColor: colors.white,
        marginBottom: verticalScale(16),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(8),
    },
    headerSubtitle: {
        fontSize: scale(14),
        color: colors.placeholder,
        textAlign: 'center',
        lineHeight: scale(20),
    },

    // Info Card
    infoCard: {
        backgroundColor: colors.white,
        marginHorizontal: scale(16),
        marginBottom: verticalScale(16),
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(12),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(6),
    },
    infoLabel: {
        fontSize: scale(14),
        color: colors.placeholder,
        flex: 1,
    },
    infoValue: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.primary,
        flex: 2,
        textAlign: 'right',
    },

    // Form Section
    formSection: {
        backgroundColor: colors.white,
        marginHorizontal: scale(16),
        marginBottom: verticalScale(16),
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    fieldContainer: {
        marginBottom: verticalScale(20),
    },
    fieldLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        color: colors.primary,
        backgroundColor: colors.background,
        minHeight: scale(44),
    },
    textArea: {
        minHeight: scale(120),
        maxHeight: scale(200),
    },
    characterCount: {
        fontSize: scale(12),
        color: colors.placeholder,
        textAlign: 'right',
        marginTop: verticalScale(4),
    },
    fieldHint: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: verticalScale(4),
        lineHeight: scale(16),
    },

    // Tags/Quick Select
    suggestionsLabel: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8),
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    tag: {
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    tagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tagText: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    tagTextSelected: {
        color: colors.white,
    },

    // Offense Levels
    offenseLevelsContainer: {
        marginBottom: verticalScale(12),
    },
    offenseLevel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(8),
        backgroundColor: colors.background,
    },
    offenseLevelSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    offenseLevelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    offenseLevelTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
        flex: 1,
    },
    offenseLevelTitleSelected: {
        color: colors.primary,
    },
    pointsBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        minWidth: scale(32),
        alignItems: 'center',
    },
    pointsText: {
        fontSize: scale(12),
        fontWeight: 'bold',
        color: colors.white,
    },
    offenseLevelDescription: {
        fontSize: scale(12),
        color: colors.placeholder,
        lineHeight: scale(16),
    },
    offenseLevelDescriptionSelected: {
        color: colors.primary,
    },

    // Points Selection
    pointsContainer: {
        flexDirection: 'row',
        gap: scale(8),
        marginBottom: verticalScale(8),
    },
    pointsOption: {
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        minWidth: scale(50),
        alignItems: 'center',
    },
    pointsOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pointsOptionText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.placeholder,
    },
    pointsOptionTextSelected: {
        color: colors.white,
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        gap: scale(12),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.placeholder,
    },
    submitButton: {
        flex: 2,
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        backgroundColor: colors.destructive,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.white,
    },
});