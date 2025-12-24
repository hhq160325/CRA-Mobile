import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingHorizontal: scale(32),
    },
    carAnimationContainer: {
        width: '100%',
        height: verticalScale(120), // Back to original height since dots are outside
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20), // Proper spacing before dots
    },
    road: {
        position: 'absolute',
        bottom: verticalScale(20),
        width: '100%', // Full width for car to drive across
        height: scale(6), // Slightly thicker road
        backgroundColor: '#2d3748', // Darker asphalt color
        borderRadius: scale(1),
        // Add road texture with shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    roadLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        width: '100%', // Full width dashed line
        height: scale(1.5), // Slightly thicker line
        backgroundColor: '#fbbf24',
        transform: [{ translateY: -scale(0.75) }],
    },
    // Add road edges for more realism
    roadEdgeTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: scale(0.5),
        backgroundColor: '#1a202c', // Darker edge
    },
    roadEdgeBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: scale(0.5),
        backgroundColor: '#1a202c', // Darker edge
    },
    // Add dashed line effect
    roadDashes: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: scale(1.5),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        transform: [{ translateY: -scale(0.75) }],
    },
    roadDash: {
        width: scale(20),
        height: scale(1.5),
        backgroundColor: '#fbbf24',
        borderRadius: scale(0.5),
    },
    carContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    carBody: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(-8),
        borderRadius: scale(8),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    carImage: {
        width: scale(80),
        height: verticalScale(50),
        borderRadius: scale(8),
        borderWidth: 2,
        borderColor: colors.primary,
    },
    carReflection: {
        position: 'absolute',
        top: verticalScale(52),
        left: 0,
        right: 0,
        height: verticalScale(25),
        overflow: 'hidden',
        opacity: 0.3,
    },
    reflectionImage: {
        transform: [{ scaleY: -1 }],
        borderWidth: 0,
        opacity: 0.6,
    },
    wheelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: scale(45),
        paddingHorizontal: scale(8),
    },
    wheel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    smokeContainer: {
        position: 'absolute',
        right: scale(-15),
        bottom: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20), // Spacing below dots, before progress text
        gap: scale(12), // Increased gap between dots
    },
    dot: {
        width: scale(14), // Much bigger dots
        height: scale(14),
        borderRadius: scale(7),
        backgroundColor: colors.primary,
    },

    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(24),
        gap: scale(8),
    },
    loadingText: {
        fontSize: scale(16),
        color: '#374151',
        fontWeight: '500',
        textAlign: 'center',
    },
    brandText: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: scale(2),
        opacity: 0.3,
        position: 'relative',
        zIndex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(32),
    },
    errorTitle: {
        fontSize: scale(16),
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: verticalScale(16),
    },
    errorMessage: {
        fontSize: scale(14),
        color: '#6b7280',
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(100),
    },
    searchBar: {
        backgroundColor: 'white',
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        height: verticalScale(44),
        fontSize: scale(14),
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(16),
        gap: scale(8),
    },
    filterButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(20),
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonInactive: {
        backgroundColor: '#f3f4f6',
    },
    filterText: {
        fontSize: scale(12),
        fontWeight: '600',
        textAlign: 'center',
    },
    filterTextActive: {
        color: 'white',
    },
    filterTextInactive: {
        color: '#6b7280',
    },
    emptyContainer: {
        padding: scale(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(16),
        color: '#6b7280',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    cardHeaderContent: {
        flex: 1,
    },
    carName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    licensePlate: {
        fontSize: scale(12),
        color: '#6b7280',
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadgeSuccess: {
        backgroundColor: '#d1fae5',
    },
    statusBadgeCancelled: {
        backgroundColor: '#fee2e2',
    },
    statusBadgePending: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: '600',
    },
    statusTextSuccess: {
        color: '#059669',
    },
    statusTextCancelled: {
        color: '#991b1b',
    },
    statusTextPending: {
        color: '#d97706',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: verticalScale(12),
    },
    detailColumn: {
        flex: 1,
    },
    detailLabel: {
        fontSize: scale(10),
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: verticalScale(4),
    },
    detailValue: {
        fontSize: scale(13),
        fontWeight: '600',
        color: colors.primary,
    },
    detailValueBold: {
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestPaymentButton: {
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: scale(8),
    },
    requestPaymentButtonActive: {
        backgroundColor: colors.morentBlue,
        opacity: 1,
    },
    requestPaymentButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    requestPaymentText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: colors.white,
    },
    confirmPickupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    confirmPickupText: {
        fontSize: scale(13),
        fontWeight: '600',
    },
    confirmPickupTextComplete: {
        color: '#00B050',
    },
    confirmPickupTextIncomplete: {
        color: colors.primary,
    },
    confirmPickupArrow: {
        fontSize: scale(20),
    },
    // Extension Information Styles
    extensionInfo: {
        backgroundColor: '#fef3c7',
        borderRadius: scale(8),
        padding: scale(12),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8),
        borderLeftWidth: scale(4),
        borderLeftColor: '#f59e0b',
    },
    extensionHeader: {
        marginBottom: verticalScale(4),
    },
    extensionLabel: {
        fontSize: scale(10),
        fontWeight: '600',
        color: '#92400e',
        letterSpacing: 0.5,
    },
    extensionDescription: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#92400e',
        marginBottom: verticalScale(4),
    },
    extensionAmount: {
        fontSize: scale(12),
        color: '#a16207',
        fontWeight: '500',
    },
    extensionDescriptionButton: {
        marginBottom: verticalScale(4),
    },
    extensionDescriptionClickable: {
        textDecorationLine: 'underline',
        color: '#1d4ed8',
    },
    extensionPaymentLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    // Extension Status and Details
    extensionStatus: {
        fontSize: scale(11),
        fontWeight: '600',
        color: '#92400e',
        marginBottom: verticalScale(4),
    },
    extensionStatusCompleted: {
        color: '#059669', // Green for completed
    },
    extensionStatusPending: {
        color: '#dc2626', // Red for pending
    },
    extensionPaymentStatusText: {
        fontSize: scale(11),
        color: '#6b7280',
        fontWeight: '500',
        marginTop: verticalScale(2),
    },
    extensionPaymentCompleted: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        backgroundColor: '#f0fdf4',
        borderRadius: scale(8),
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    extensionPaymentCompletedText: {
        fontSize: scale(12),
        color: '#059669',
        fontWeight: '600',
    },
    extensionDetails: {
        marginBottom: verticalScale(8),
    },
    extensionDays: {
        fontSize: scale(11),
        color: '#a16207',
        fontWeight: '500',
        marginTop: verticalScale(2),
    },
    // Extension Payment Button Styles
    extensionPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: scale(8),
        marginTop: verticalScale(8),
        gap: scale(6),
    },
    extensionPaymentButtonActive: {
        backgroundColor: '#f59e0b',
    },
    extensionPaymentButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    extensionPaymentText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: 'white',
    },

    // Extension Requirement Styles
    extensionRequirement: {
        backgroundColor: '#fef2f2',
        borderRadius: scale(8),
        padding: scale(8),
        marginTop: verticalScale(8),
        borderLeftWidth: scale(3),
        borderLeftColor: '#ef4444',
    },
    extensionRequirementText: {
        fontSize: scale(11),
        color: '#dc2626',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Background Animation Styles
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f9fafb',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle1: {
        position: 'absolute',
        width: scale(200),
        height: scale(200),
        borderRadius: scale(100),
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        top: '10%',
        left: '10%',
    },
    backgroundCircle2: {
        position: 'absolute',
        width: scale(150),
        height: scale(150),
        borderRadius: scale(75),
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        top: '60%',
        right: '10%',
    },
    backgroundCircle3: {
        position: 'absolute',
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        top: '30%',
        right: '30%',
    },

    // Tire Burning Effects
    skidMarks: {
        position: 'absolute',
        bottom: scale(-5),
        left: scale(-30),
        flexDirection: 'row',
        gap: scale(15),
    },
    skidMark: {
        width: scale(2),
        height: scale(20),
        backgroundColor: '#1f2937',
        opacity: 0.6,
    },
    tireSmokeContainer: {
        position: 'absolute',
        bottom: scale(5),
        left: scale(-25),
        flexDirection: 'row',
        gap: scale(5),
    },
    sparksContainer: {
        position: 'absolute',
        bottom: scale(0),
        left: scale(10),
        right: scale(10),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    spark: {
        width: scale(3),
        height: scale(3),
        backgroundColor: '#fbbf24',
        borderRadius: scale(1.5),
    },
    spark2: {
        backgroundColor: '#f59e0b',
        transform: [{ translateX: scale(5) }, { translateY: scale(-3) }],
    },
    spark3: {
        backgroundColor: '#ef4444',
        transform: [{ translateX: scale(-5) }, { translateY: scale(-2) }],
    },
    spark4: {
        backgroundColor: '#fbbf24',
        transform: [{ translateX: scale(8) }, { translateY: scale(2) }],
    },
    spark5: {
        backgroundColor: '#f59e0b',
        transform: [{ translateX: scale(-8) }, { translateY: scale(1) }],
    },
});