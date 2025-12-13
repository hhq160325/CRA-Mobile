import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import ChatItem from './ChatItem';
import EmptyState from './EmptyState';
import type { ChatHead } from '../types/chatTypes';

interface ChatListProps {
    chatHeads: ChatHead[];
    refreshing: boolean;
    onRefresh: () => void;
    onChatPress: (chat: ChatHead) => void;
}

export default function ChatList({ chatHeads, refreshing, onRefresh, onChatPress }: ChatListProps) {
    return (
        <ScrollView
            style={{ flex: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {chatHeads.length === 0 ? (
                <EmptyState />
            ) : (
                chatHeads.map((chat) => (
                    <ChatItem
                        key={chat.userId}
                        chat={chat}
                        onPress={onChatPress}
                    />
                ))
            )}
        </ScrollView>
    );
}