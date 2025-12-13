import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../../lib/auth-context';
import { apiClient } from '../../../../lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '../../../../lib/api/config';
import { inquiryService } from '../../../../lib/api';
import type { Message } from '../types/chatTypes';

interface UseChatProps {
    carId: string;
    navigation: any;
}

export function useChat({ carId, navigation }: UseChatProps) {
    const { user } = useAuth();
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

    useFocusEffect(
        useCallback(() => {
            if (!user?.id || !ownerId) return;

            fetchMessages();

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

                if (data.length > 0) {
                    console.log('First message sample:', JSON.stringify(data[0], null, 2));
                }

                const sorted = data.sort(
                    (a: Message, b: Message) =>
                        new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
                );

                const realMessages = sorted.filter((msg: Message) => !msg.id.startsWith('temp-'));

                setMessages(prevMessages => {
                    const optimisticMessages = prevMessages.filter(msg => msg.id.startsWith('temp-'));
                    console.log('Existing optimistic messages:', optimisticMessages.length);

                    const filteredOptimisticMessages = optimisticMessages.filter(optimistic => {
                        const hasRealVersion = realMessages.some((real: Message) =>
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

                    const allMessages = [...realMessages, ...filteredOptimisticMessages];

                    return allMessages.sort(
                        (a: Message, b: Message) =>
                            new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
                    );
                });
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

    const handleSendMessage = async (scrollToEnd: () => void) => {
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
            const result = await inquiryService.createInquiry({
                title: `Chat about ${carName}`,
                content: message.trim(),
                senderId: user.id,
                receiverId: ownerId,
            });

            if (result.error) {
                Alert.alert('Error', 'Failed to send message. Please try again.');
                setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
                return;
            }

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

            setMessages(prev => [...prev, optimisticMessage]);
            setMessage('');

            setTimeout(() => {
                scrollToEnd();
            }, 100);

            // Multiple refresh attempts to ensure message appears
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
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        message,
        setMessage,
        loading,
        fetchingData,
        ownerId,
        ownerUsername,
        carName,
        messages,
        refreshing,
        autoRefreshing,
        user,

        // Actions
        handleSendMessage,
        fetchMessages,
    };
}