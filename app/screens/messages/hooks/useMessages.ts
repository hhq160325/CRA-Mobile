import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../../lib/auth-context';
import { inquiryService, bookingsService } from '../../../../lib/api';
import { apiClient } from '../../../../lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '../../../../lib/api/config';
import type { MessageItem, CarOwnerInfo, MessageFormData } from '../types/messageTypes';

interface UseMessagesProps {
    bookingId: string;
    bookingNumber?: string;
    navigation: any;
}

export function useMessages({ bookingId, bookingNumber, navigation }: UseMessagesProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOwner, setFetchingOwner] = useState(true);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [ownerUsername, setOwnerUsername] = useState<string>('');
    const [carName, setCarName] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<MessageItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchCarOwner();
    }, [bookingId]);

    useEffect(() => {
        if (user?.id) {
            fetchChatHistory();
        }
    }, [user?.id]);

    const fetchChatHistory = async () => {
        if (!user?.id) return;

        setLoadingHistory(true);
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/Inquiry/${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        accept: '*/*',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                const sorted = data.sort(
                    (a: MessageItem, b: MessageItem) =>
                        new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                );

                setChatHistory(prevHistory => {
                    const optimisticMessages = prevHistory.filter(msg => msg.id.startsWith('temp-'));

                    const filteredOptimisticMessages = optimisticMessages.filter(optimistic => {
                        const hasRealVersion = sorted.some((real: MessageItem) =>
                            real.title === optimistic.title &&
                            real.content === optimistic.content &&
                            real.senderId === optimistic.senderId &&
                            Math.abs(new Date(real.createDate).getTime() - new Date(optimistic.createDate).getTime()) < 30000 // Within 30 seconds
                        );
                        if (hasRealVersion) {
                            console.log('Removing optimistic message, found real version:', optimistic.title);
                        }
                        return !hasRealVersion;
                    });

                    const allMessages = [...filteredOptimisticMessages, ...sorted];

                    return allMessages.sort(
                        (a: MessageItem, b: MessageItem) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                    );
                });
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const validateBookingId = () => {
        if (!bookingId && !bookingNumber) {
            Alert.alert('Error', 'Booking information is required');
            navigation.goBack();
            return false;
        }
        return true;
    };

    const extractCarOwnerInfo = (carData: any): CarOwnerInfo => {
        const owner = carData.owner;
        if (!owner || !owner.id) {
            throw new Error('Car owner information not available');
        }

        return {
            ownerId: owner.id,
            ownerUsername: owner.username || 'Car Owner',
            carName: `${carData.manufacturer} ${carData.model}`,
        };
    };

    const fetchCarOwner = async () => {
        if (!validateBookingId()) return;

        setFetchingOwner(true);
        try {
            let bookingData = null;
            let carData = null;

            if (bookingNumber) {
                console.log('Fetching booking details using bookingNumber:', bookingNumber);
                const bookingRes = await bookingsService.getBookingByNumber(bookingNumber);

                if (bookingRes.data && bookingRes.data.car) {
                    bookingData = bookingRes.data;
                    const carId = bookingRes.data.car.id;

                    console.log('Fetching complete car details for carId:', carId);
                    const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                        method: 'GET',
                    });

                    if (carRes.data) {
                        carData = carRes.data;
                        console.log('Successfully fetched complete car data with owner info');
                    } else {
                        console.log('Failed to fetch complete car details, using basic car info');
                        carData = bookingRes.data.car;
                    }
                }
            }

            if (!carData) {
                console.log('Falling back to bookingId approach');
                const bookingRes = await bookingsService.getBookingById(bookingId);
                if (bookingRes.error || !bookingRes.data) {
                    Alert.alert('Error', 'Failed to load booking details');
                    navigation.goBack();
                    return;
                }

                const carId = bookingRes.data.carId;
                if (!carId) {
                    Alert.alert('Error', 'Car information not found');
                    navigation.goBack();
                    return;
                }

                const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                    method: 'GET',
                });

                if (carRes.error || !carRes.data) {
                    Alert.alert('Error', 'Failed to load car details');
                    navigation.goBack();
                    return;
                }

                carData = carRes.data;
            }

            if (!carData) {
                Alert.alert('Error', 'Car information not found');
                navigation.goBack();
                return;
            }

            try {
                const { ownerId: fetchedOwnerId, ownerUsername: fetchedOwnerUsername, carName: fetchedCarName } = extractCarOwnerInfo(carData);

                setOwnerId(fetchedOwnerId);
                setOwnerUsername(fetchedOwnerUsername);
                setCarName(fetchedCarName);
                setTitle(`Inquiry about ${fetchedCarName}`);
            } catch (ownerError) {
                console.error('Error extracting owner info:', ownerError);
                Alert.alert('Error', 'Failed to load car owner information');
                navigation.goBack();
                return;
            }
        } catch (error) {
            console.error('Error fetching car owner:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load car owner information';
            Alert.alert('Error', errorMessage);
            navigation.goBack();
        } finally {
            setFetchingOwner(false);
        }
    };

    const validateMessageForm = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a message title');
            return false;
        }

        if (!content.trim()) {
            Alert.alert('Required', 'Please enter your message');
            return false;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return false;
        }

        if (!ownerId) {
            Alert.alert('Error', 'Car owner information not available');
            return false;
        }

        return true;
    };

    const handleSendMessage = async () => {
        if (!validateMessageForm()) return;

        setLoading(true);
        try {
            const result = await inquiryService.createInquiry({
                title: title.trim(),
                content: content.trim(),
                senderId: user!.id,
                receiverId: ownerId!,
            });

            if (result.error) {
                Alert.alert('Error', 'Failed to send message. Please try again.');
                setChatHistory(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
                return;
            }

            const optimisticMessage: MessageItem = {
                id: `temp-${Date.now()}`,
                title: title.trim(),
                content: content.trim(),
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
                status: 'Open',
                type: 'Question',
                senderId: user!.id,
                receiverId: ownerId!,
            };

            setChatHistory(prev => [optimisticMessage, ...prev]);
            setContent('');

            Alert.alert('Success', 'Your message has been sent to the car owner!');


            setTimeout(async () => {
                console.log('First refresh after sending message...');
                await fetchChatHistory();
            }, 1000);

            setTimeout(async () => {
                console.log('Second refresh after sending message...');
                await fetchChatHistory();
            }, 3000);

            setTimeout(async () => {
                console.log('Third refresh after sending message...');
                await fetchChatHistory();
            }, 5000);

        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'An unexpected error occurred');
            setChatHistory(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    return {

        title,
        setTitle,
        content,
        setContent,


        loading,
        fetchingOwner,
        loadingHistory,


        ownerId,
        ownerUsername,
        carName,


        chatHistory,
        user,

        handleSendMessage,
        fetchChatHistory,
    };
}