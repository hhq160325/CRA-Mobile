import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../messages.styles';
import { formatMessageDate } from '../utils/messageUtils';
import type { MessageItem as MessageItemType } from '../types/messageTypes';

interface MessageItemProps {
    message: MessageItemType;
    ownerUsername: string;
    userId?: string;
    index: number;
    totalMessages: number;
}

export default function MessageItem({
    message,
    ownerUsername,
    userId,
    index,
    totalMessages
}: MessageItemProps) {
    const isSentByMe = message.senderId === userId;

    return (
        <View
            style={[
                styles.messageItem,
                isSentByMe ? styles.messageItemSent : styles.messageItemReceived,
                index < totalMessages - 1 && styles.messageItemSpacing,
            ]}>
            <View style={styles.messageHeader}>
                <Text
                    style={[
                        styles.messageSender,
                        isSentByMe ? styles.messageSenderSent : styles.messageSenderReceived,
                    ]}>
                    {isSentByMe ? 'You' : ownerUsername}
                </Text>
                <Text style={styles.messageDate}>
                    {formatMessageDate(message.createDate)}
                </Text>
            </View>
            {message.title && (
                <Text style={styles.messageTitle}>{message.title}</Text>
            )}
            <Text style={styles.messageContent}>{message.content}</Text>
            <View style={styles.messageFooter}>
                <View
                    style={[
                        styles.statusBadge,
                        message.status === 'Open' ? styles.statusBadgeOpen : styles.statusBadgeClosed,
                    ]}>
                    <Text
                        style={[
                            styles.statusText,
                            message.status === 'Open' ? styles.statusTextOpen : styles.statusTextClosed,
                        ]}>
                        {message.status}
                    </Text>
                </View>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{message.type}</Text>
                </View>
            </View>
        </View>
    );
}