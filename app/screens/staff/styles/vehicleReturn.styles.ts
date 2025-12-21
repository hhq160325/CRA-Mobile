import { StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

export const vehicleReturnStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(14),
        color: "#6b7280",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    errorText: {
        fontSize: scale(16),
        color: "#ef4444",
        marginTop: verticalScale(16),
        marginBottom: verticalScale(24),
        textAlign: "center",
    },
    backButtonError: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    backButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: "600",
    },
    gpsButtonContainer: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(8),
        gap: scale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gpsButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },

    // Success Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: scale(16),
        padding: scale(24),
        marginHorizontal: scale(20),
        maxWidth: scale(400),
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    modalTitle: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(8),
    },
    modalSubtitle: {
        fontSize: scale(14),
        color: colors.placeholder,
        textAlign: 'center',
        lineHeight: scale(20),
    },
    modalContent: {
        marginBottom: verticalScale(24),
    },
    modalQuestion: {
        fontSize: scale(16),
        color: colors.primary,
        textAlign: 'center',
        lineHeight: scale(22),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: scale(12),
    },
    modalButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    skipButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.placeholder,
    },
    reportButton: {
        backgroundColor: colors.destructive,
        flexDirection: 'row',
        gap: scale(8),
    },
    reportButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.white,
    },

    // Embedded Report Form Styles
    reportSection: {
        backgroundColor: colors.white,
        marginHorizontal: scale(16),
        marginVertical: verticalScale(16),
        borderRadius: scale(12),
        padding: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    reportHeader: {
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    reportTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(4),
    },
    reportSubtitle: {
        fontSize: scale(14),
        color: colors.placeholder,
        textAlign: 'center',
    },
    reportActions: {
        gap: verticalScale(12),
    },
    reportActionButton: {
        backgroundColor: colors.destructive,
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    reportActionButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.white,
    },
    skipActionButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        alignItems: 'center',
    },
    skipActionButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.placeholder,
    },

    // Report Form Styles
    reportForm: {
        marginTop: verticalScale(16),
    },
    bookingInfo: {
        backgroundColor: colors.background,
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(16),
    },
    bookingInfoTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    bookingInfoText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(2),
    },
    formField: {
        marginBottom: verticalScale(16),
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
        minHeight: scale(100),
        maxHeight: scale(150),
    },
    characterCount: {
        fontSize: scale(12),
        color: colors.placeholder,
        textAlign: 'right',
        marginTop: verticalScale(4),
    },
    suggestionsLabel: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8),
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(6),
    },
    tag: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(6),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    tagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tagText: {
        fontSize: scale(11),
        color: colors.placeholder,
    },
    tagTextSelected: {
        color: colors.white,
    },
    offenseLevelsContainer: {
        gap: verticalScale(8),
    },
    offenseLevel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        padding: scale(12),
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
        borderRadius: scale(10),
        minWidth: scale(28),
        alignItems: 'center',
    },
    pointsText: {
        fontSize: scale(11),
        fontWeight: 'bold',
        color: colors.white,
    },
    offenseLevelDescription: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    offenseLevelDescriptionSelected: {
        color: colors.primary,
    },
    formActions: {
        flexDirection: 'row',
        gap: scale(12),
        marginTop: verticalScale(16),
    },
    cancelFormButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    cancelFormButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.placeholder,
    },
    submitFormButton: {
        flex: 2,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        backgroundColor: colors.destructive,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
    },
    submitFormButtonDisabled: {
        opacity: 0.6,
    },
    submitFormButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.white,
    },
})
