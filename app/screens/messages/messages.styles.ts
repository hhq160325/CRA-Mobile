import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: colors.placeholder,
    },
    chatHistoryCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    chatHistoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    chatHistoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        marginLeft: 8,
    },
    messageItem: {
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
    },
    messageItemSent: {
        backgroundColor: '#E3F2FD',
        borderLeftColor: colors.morentBlue,
    },
    messageItemReceived: {
        backgroundColor: '#F5F5F5',
        borderLeftColor: colors.placeholder,
    },
    messageItemSpacing: {
        marginBottom: 12,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    messageSender: {
        fontSize: 12,
        fontWeight: '600',
    },
    messageSenderSent: {
        color: colors.morentBlue,
    },
    messageSenderReceived: {
        color: colors.primary,
    },
    messageDate: {
        fontSize: 10,
        color: colors.placeholder,
    },
    messageTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 4,
    },
    messageContent: {
        fontSize: 13,
        color: colors.primary,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    statusBadgeOpen: {
        backgroundColor: '#FFF3E0',
    },
    statusBadgeClosed: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    statusTextOpen: {
        color: '#F57C00',
    },
    statusTextClosed: {
        color: '#2E7D32',
    },
    typeBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeText: {
        fontSize: 10,
        color: colors.placeholder,
    },
    headerCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerContent: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.placeholder,
    },
    inputCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: colors.primary,
    },
    textArea: {
        minHeight: 150,
        textAlignVertical: 'top',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 12,
        color: colors.primary,
        flex: 1,
    },
    sendButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: colors.morentBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sendButtonActive: {
        backgroundColor: colors.morentBlue,
    },
    sendButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    sendButtonIcon: {
        marginRight: 8,
    },
    sendButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
