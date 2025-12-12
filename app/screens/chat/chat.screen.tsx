import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    RefreshControl,
    AppState,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';
import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '../../../lib/api/config';
import { inquiryService } from '../../../lib/api';

interface Message {
    id: string;
    title: string | null;
    content: string;
    createDate: string;
    updateDate: string;
    status: string;
    type: string;
    senderId: string;
    receiverId: string;
    parentInquiryId: string | null;
    imageUrls: string[];
}

export default function ChatScreen() {
    const route = useRoute<RouteProp<{ params: { carId: string } }, 'params'>>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { carId } = (route.params as any) || {};
    const scrollViewRef = useRef<ScrollView>(null);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [ownerUsername, setOwnerUsername] = useState<string>('');
    const [carName, setCarName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const [autoRefreshing, setAutoRefreshing] = useState(false);

    useEffect(() => {
        fetchCarOwner();
    }, [carId]);

    // Listen for app state changes to refresh when app comes to foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && user?.id && ownerId) {
                console.log('App became active, refreshing messages...');
                fetchMessages();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [user?.id, ownerId]);

    // Auto-refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!user?.id || !ownerId) return;

            // Initial fetch
            fetchMessages();

            // Set up aggressive auto-refresh every 2 seconds when screen is active
            const interval = setInterval(() => {
                console.log('Auto-refreshing messages...');
                fetchMessages(false, true);
            }, 2000);

            return () => {
                console.log('Clearing auto-refresh interval');
                clearInterval(interval);
            };
        }, [user?.id, ownerId])
    );

    const fetchCarOwner = async () => {
        if (!carId) {
            Alert.alert('Error', 'Car ID is required');
            navigation.goBack();
            return;
        }

        setFetchingData(true);
        try {
            const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                method: 'GET',
            });

            if (carRes.error || !carRes.data) {
                Alert.alert('Error', 'Failed to load car details');
                navigation.goBack();
                return;
            }

            const carData = carRes.data;
            const owner = carData.owner;

            if (!owner || !owner.id) {
                Alert.alert('Error', 'Car owner information not available');
                navigation.goBack();
                return;
            }

            const carName = `${carData.manufacturer} ${carData.model}`;

            setOwnerId(owner.id);
            setOwnerUsername(owner.username || 'Car Owner');
            setCarName(carName);
        } catch (error) {
            console.error('Error fetching car owner:', error);
            Alert.alert('Error', 'Failed to load car owner information');
            navigation.goBack();
        } finally {
            setFetchingData(false);
        }
    };

    const fetchMessages = async (showRefreshing = false, isAutoRefresh = false) => {
        if (!user?.id || !ownerId) return;

        if (showRefreshing) {
            setRefreshing(true);
        } else if (isAutoRefresh) {
            setAutoRefreshing(true);
        }

        try {
            const url = `${API_CONFIG.BASE_URL}/Inquiry/chatLog?senderId=${user.id}&receiverId=${ownerId}`;
            console.log('Fetching chat messages from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    accept: '*/*',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chat messages received:', data.length, 'messages');
                console.log('Is auto refresh:', isAutoRefresh);

                // Log first message to check structure
                if (data.length > 0) {
                    console.log('First message sample:', JSON.stringify(data[0], null, 2));
                }

                // Sort by date, oldest first for chat view
                const sorted = data.sort(
                    (a: Message, b: Message) =>
                        new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
                );

                // Filter out temporary optimistic messages and replace with real ones
                const realMessages = sorted.filter(msg => !msg.id.startsWith('temp-'));

                // Merge with existing optimistic messages to avoid losing them during auto-refresh
                setMessages(prevMessages => {
                    // Get any existing optimistic messages
                    const optimisticMessages = prevMessages.filter(msg => msg.id.startsWith('temp-'));
                    console.log('Existing optimistic messages:', optimisticMessages.length);

                    // Remove optimistic messages that have been confirmed by server
                    // (if a real message has the same content and sender, remove the optimistic one)
                    const filteredOptimisticMessages = optimisticMessages.filter(optimistic => {
                        const hasRealVersion = realMessages.some(real =>
                            real.content === optimistic.content &&
                            real.senderId === optimistic.senderId &&
                            Math.abs(new Date(real.createDate).getTime() - new Date(optimistic.createDate).getTime()) < 30000 // Within 30 seconds
                        );
                        if (hasRealVersion) {
                            console.log('Removing optimistic message, found real version:', optimistic.content);
                        }
                        return !hasRealVersion;
                    });

                    console.log('Filtered optimistic messages:', filteredOptimisticMessages.length);
                    console.log('Real messages from server:', realMessages.length);

                    // Combine real messages with remaining optimistic ones
                    const allMessages = [...realMessages, ...filteredOptimisticMessages];

                    // Sort again to maintain chronological order
                    return allMessages.sort(
                        (a: Message, b: Message) =>
                            new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
                    );
                });

                // Scroll to bottom after loading messages
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } else {
                console.error('Failed to fetch messages, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (showRefreshing) {
                setRefreshing(false);
            } else if (isAutoRefresh) {
                setAutoRefreshing(false);
            }
        }
    };



    const handleSendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        if (!ownerId) {
            Alert.alert('Error', 'Car owner information not available');
            return;
        }

        setLoading(true);
        try {
            // Send text-only message
            const result = await inquiryService.createInquiry({
                title: `Chat about ${carName}`,
                content: message.trim(),
                senderId: user.id,
                receiverId: ownerId,
            });

            if (result.error) {
                Alert.alert('Error', 'Failed to send message. Please try again.');
                // Remove the optimistic message on error
                setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
                return;
            }

            // Add optimistic message to UI immediately
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                title: `Chat about ${carName}`,
                content: message.trim(),
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
                status: 'Sent',
                type: 'Question',
                senderId: user.id,
                receiverId: ownerId,
                parentInquiryId: null,
                imageUrls: [],
            };

            // Add to messages immediately for better UX
            setMessages(prev => [...prev, optimisticMessage]);

            // Clear input
            setMessage('');

            // Scroll to bottom immediately
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);

            // Fetch messages multiple times to ensure we get the new message
            setTimeout(async () => {
                console.log('First refresh after sending message...');
                await fetchMessages();
            }, 1000);

            setTimeout(async () => {
                console.log('Second refresh after sending message...');
                await fetchMessages();
            }, 3000);

            setTimeout(async () => {
                console.log('Third refresh after sending message...');
                await fetchMessages();
            }, 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'An unexpected error occurred');
            // Remove the optimistic message on error
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={{ flex: 1 }}>
                <Header />

                {/* Chat Header */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#9C27B0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                        }}>
                        <Text style={{ fontSize: 20, color: colors.white }}>
                            {ownerUsername.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: colors.primary,
                            }}>
                            {ownerUsername}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: colors.placeholder }}>
                                {carName}
                            </Text>
                            {autoRefreshing && (
                                <View style={{
                                    marginLeft: 8,
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: '#4CAF50'
                                }} />
                            )}
                        </View>
                    </View>

                </View>

                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1, backgroundColor: '#F5F5F5' }}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMessages(true)}
                            colors={['#9C27B0']}
                            tintColor="#9C27B0"
                        />
                    }
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                    }>
                    {messages.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 40,
                            }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: colors.placeholder,
                                    textAlign: 'center',
                                }}>
                                No messages yet
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: colors.placeholder,
                                    textAlign: 'center',
                                    marginTop: 8,
                                }}>
                                Start a conversation with {ownerUsername}
                            </Text>
                        </View>
                    ) : (
                        messages.map((msg) => {
                            const isSentByMe = msg.senderId === user?.id;
                            const date = new Date(msg.createDate);
                            const formattedTime = date.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <View
                                    key={msg.id}
                                    style={{
                                        marginBottom: 12,
                                        alignItems: isSentByMe ? 'flex-end' : 'flex-start',
                                    }}>
                                    <View
                                        style={{
                                            maxWidth: '75%',
                                            backgroundColor: isSentByMe
                                                ? '#9C27B0'
                                                : colors.white,
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 20,
                                            borderBottomRightRadius: isSentByMe ? 4 : 20,
                                            borderBottomLeftRadius: isSentByMe ? 20 : 4,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 2,
                                        }}>
                                        {msg.imageUrls && msg.imageUrls.length > 0 ? (
                                            <View style={{ marginBottom: 8 }}>
                                                {msg.imageUrls.map((imgUrl, idx) => {
                                                    console.log('Rendering image:', imgUrl);
                                                    return (
                                                        <Image
                                                            key={idx}
                                                            source={{ uri: imgUrl }}
                                                            style={{
                                                                width: 200,
                                                                height: 150,
                                                                borderRadius: 12,
                                                                marginBottom: 4,
                                                            }}
                                                            resizeMode="cover"
                                                            onError={(e) =>
                                                                console.error(
                                                                    'Image load error:',
                                                                    e.nativeEvent.error,
                                                                )
                                                            }
                                                        />
                                                    );
                                                })}
                                            </View>
                                        ) : null}
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                color: isSentByMe ? colors.white : colors.primary,
                                                lineHeight: 20,
                                            }}>
                                            {msg.content}
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: colors.placeholder,
                                            marginTop: 4,
                                            marginHorizontal: 8,
                                        }}>
                                        {formattedTime}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Message Input */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}>


                    {/* Input Row */}
                    <View
                        style={{
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>

                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.placeholder}
                            multiline
                            maxLength={500}
                            style={{
                                flex: 1,
                                backgroundColor: '#F5F5F5',
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                fontSize: 15,
                                color: colors.primary,
                                maxHeight: 100,
                            }}
                        />
                        <Pressable
                            onPress={handleSendMessage}
                            disabled={loading || !message.trim()}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor:
                                    loading || !message.trim()
                                        ? colors.placeholder
                                        : '#9C27B0',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <MaterialIcons name="send" size={20} color={colors.white} />
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
