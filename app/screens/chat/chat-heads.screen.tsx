import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useChatHeads } from './hooks/useChatHeads';
import ChatHeader from './components/ChatHeader';
import ChatList from './components/ChatList';
import LoadingState from './components/LoadingState';
import type { ChatHead } from './types/chatTypes';

export default function ChatHeadsScreen() {
    const { chatHeads, loading, refreshing, onRefresh } = useChatHeads();

    const handleChatPress = (chat: ChatHead) => {
        // Navigate to chat screen - we need carId
        // For now, we'll need to pass userId and fetch car info
        console.log('Open chat with:', chat.userId);
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />
            <ChatHeader />
            <ChatList
                chatHeads={chatHeads}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onChatPress={handleChatPress}
            />
        </View>
    );
}
