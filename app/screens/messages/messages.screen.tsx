import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import { useMessages } from './hooks/useMessages';
import MessageLoadingState from './components/MessageLoadingState';
import MessageHeader from './components/MessageHeader';
import MessageForm from './components/MessageForm';
import { styles } from './messages.styles';

export default function MessagesScreen() {
    const route = useRoute<RouteProp<{ params: { bookingId: string; bookingNumber?: string; licensePlate?: string } }, 'params'>>();
    const navigation = useNavigation();
    const { bookingId, bookingNumber, licensePlate } = (route.params as any) || {};

    const {
        title,
        setTitle,
        content,
        setContent,
        loading,
        fetchingOwner,
        ownerUsername,
        carName,
        user,
        handleSendMessage,
    } = useMessages({ bookingId, bookingNumber, licensePlate, navigation });

    if (fetchingOwner) {
        return <MessageLoadingState />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <Header />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">
                    <MessageHeader
                        ownerUsername={ownerUsername}
                        carName={carName}
                    />
                    <MessageForm
                        title={title}
                        content={content}
                        loading={loading}
                        onTitleChange={setTitle}
                        onContentChange={setContent}
                        onSend={handleSendMessage}
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
