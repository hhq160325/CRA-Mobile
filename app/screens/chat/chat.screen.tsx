import React, { useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useChat } from './hooks/useChat';
import ChatScreenHeader from './components/ChatScreenHeader';
import MessagesList from './components/MessagesList';
import MessageInput from './components/MessageInput';
import ChatLoadingState from './components/ChatLoadingState';

export default function ChatScreen() {
    const route = useRoute<RouteProp<{ params: { carId: string } }, 'params'>>();
    const navigation = useNavigation();
    const { carId } = (route.params as any) || {};
    const scrollViewRef = useRef<ScrollView>(null);

    const {
        message,
        setMessage,
        loading,
        fetchingData,
        ownerUsername,
        carName,
        messages,
        refreshing,
        autoRefreshing,
        user,
        handleSendMessage,
        fetchMessages,
    } = useChat({ carId, navigation });

    const scrollToEnd = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const onSendMessage = () => {
        handleSendMessage(scrollToEnd);
    };

    const onRefresh = () => {
        fetchMessages(true);
    };

    if (fetchingData) {
        return <ChatLoadingState />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={{ flex: 1 }}>
                <Header />
                <ChatScreenHeader
                    ownerUsername={ownerUsername}
                    carName={carName}
                    autoRefreshing={autoRefreshing}
                />
                <MessagesList
                    ref={scrollViewRef}
                    messages={messages}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ownerUsername={ownerUsername}
                    userId={user?.id}
                />
                <MessageInput
                    message={message}
                    onChangeText={setMessage}
                    onSend={onSendMessage}
                    loading={loading}
                />
            </View>
        </KeyboardAvoidingView>
    );
}
