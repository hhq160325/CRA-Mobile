import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from '../messages.styles';
import MessageItem from './MessageItem';
import type { MessageItem as MessageItemType } from '../types/messageTypes';

interface ChatHistoryProps {
    chatHistory: MessageItemType[];
    ownerUsername: string;
    userId?: string;
}

export default function ChatHistory({ chatHistory, ownerUsername, userId }: ChatHistoryProps) {
    if (chatHistory.length === 0) return null;

    return (
        <View style={styles.chatHistoryCard}>
            <View style={styles.chatHistoryHeader}>
                <MaterialIcons name="history" size={20} color={colors.morentBlue} />
                <Text style={styles.chatHistoryTitle}>Chat History</Text>
            </View>
            {chatHistory.map((message, index) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    ownerUsername={ownerUsername}
                    userId={userId}
                    index={index}
                    totalMessages={chatHistory.length}
                />
            ))}
        </View>
    );
}